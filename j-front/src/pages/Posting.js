import React, { useEffect, useRef, useState } from "react";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import apiClient from "../helpers/apiClient";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const styles = {
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    marginRight: '10px',
    width: '100%',
    boxSizing: 'border-box'
  },
  mapContainer: {
    width: '100%',
    height: '400px',
    marginBottom: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  searchResultList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginTop: '10px',
    maxHeight: '200px', // Limit the height of the list for better UI
    overflowY: 'auto', // Add a scroll if there are too many items
  },
  searchResultItem: {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  // Customize the pointer style
  pointer: {
    cursor: 'pointer',
  }
};

function Posting() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(''); // title 상태 추가
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postDetails, setPostDetails] = useState({
    address: '',
    placeName: '',
    themeEnum: 'HEALING'
  });
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const mapContainerRef = useRef(null);
  const navigate = useNavigate();
  const [hoveredItemId, setHoveredItemId] = useState(null);


  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const response = await apiClient.get('/users/me', {
          headers: {
            Authorization: `${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });
        setLoggedInUserId(response.data.data.userId);
      } catch (error) {
        console.error('유저 정보를 가져오는데 실패했습니다.', error);
        window.alert(`유저 정보를 가져오는데 실패했습니다: ${error.response.data.message}`);
      }
    };
    fetchLoggedInUser();
    loadKakaoMapsScript();
  }, []);

  useEffect(() => {
    if (mapsLoaded && mapContainerRef.current) {
      const mapContainer = mapContainerRef.current;
      const mapOptions = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 3
      };

      const map = new window.kakao.maps.Map(mapContainer, mapOptions);
      const ps = new window.kakao.maps.services.Places();
      const geocoder = new window.kakao.maps.services.Geocoder();

      const searchPlaces = (query) => {
        ps.keywordSearch(query, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setSearchResults(data);
          } else {
            window.alert(`검색에 실패했습니다. ${status}`);
          }
        });
      };

      const handleMapClick = (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        const lat = latlng.getLat();
        const lng = latlng.getLng();

        geocoder.coord2RegionCode(lng, lat, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const place = result[0];
            setPostDetails(prevDetails => ({
              ...prevDetails,
              address: place.address_name,
              placeName: place.place_name
            }));
          } else {
            window.alert(`주소 검색에 실패했습니다. ${status}`);
          }
        });
      };

      window.kakao.maps.event.addListener(map, 'click', handleMapClick);
    }
  }, [mapsLoaded]);



  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file)); // Set the preview image
  };

  const handleSavePost = async (e) => {
    e.preventDefault();

    try {
      let imageId = null;

      // 이미지가 선택된 경우 업로드
      if (profileImage) {
        const imageData = new FormData();
        imageData.append('images', profileImage);

        const imageResponse = await apiClient.post('/images', imageData, {
          headers: {
            Authorization: `${localStorage.getItem('authToken')}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (imageResponse.data && imageResponse.data.data) {
          imageId = imageResponse.data.data.id; // 서버에서 반환된 이미지 ID
        }
      }

      // 게시물 작성
      const postPayload = {
        title: title, // 제목 추가
        content: content,
        address: postDetails.address,
        placeName: postDetails.placeName,
        theme: postDetails.themeEnum,
        imageIdList: imageId ? [imageId] : [] // 이미지 ID를 배열로 전달
      };

      const postResponse = await apiClient.post('/posts', postPayload, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });

      if (postResponse.data && postResponse.data.data) {
        // 성공적으로 게시물 작성 후 메시지 표시
        alert("포스팅 완료 !")
        navigate(`/posts/${postResponse.data.data.id}`) // 메시지 표시 후 페이지 이동
        }

    } catch (error) {
      console.error('게시물 작성에 실패했습니다.');
      toast.error('게시물 작성에 실패했습니다.');
    }
  };

  const handleMouseEnter = (placeId) => {
    setHoveredItemId(placeId);
  };

  const handleMouseLeave = () => {
    setHoveredItemId(null);
  };


  const loadKakaoMapsScript = () => {
    const scriptUrl = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=1b3fb716f9111507c799266af6e4a45b&libraries=services,clusterer,drawing&autoload=false"
    if (window.kakao && window.kakao.maps) {
      setMapsLoaded(true);
      return;
    }

    const existingScript = document.getElementById('kakao-maps-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'kakao-maps-script';
      script.src = scriptUrl;
      script.onload = () => {
        window.kakao.maps.load(() => {
          setMapsLoaded(true);
          console.log('Kakao Maps API loaded');
        });
      };
      script.onerror = () => {
        console.error('Failed to load Kakao Maps API script');
      };
      document.body.appendChild(script);
    } else {
      console.log('Kakao Maps API script already loaded');
    }
  };

  const initializeMap = () => {
    const mapContainer = mapContainerRef.current;
    const southKoreaBounds = new window.kakao.maps.LatLngBounds(
        new window.kakao.maps.LatLng(33.0, 124.0), // Southwest corner (Jeju Island area)
        new window.kakao.maps.LatLng(38.5, 132.0)  // Northeast corner (near Ulleungdo)
    );
    const mapOptions = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // Center the map on Seoul
      level: 3, // Zoom level (adjust as needed)
      maxLevel: 10 // Restrict max zoom out level to avoid seeing North Korea
    };

    const map = new window.kakao.maps.Map(mapContainer, mapOptions);
    const ps = new window.kakao.maps.services.Places();
    const geocoder = new window.kakao.maps.services.Geocoder();

    map.setBounds(southKoreaBounds); // Set the maximum bounds to the defined area
    const searchPlaces = (query) => {
      ps.keywordSearch(query, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(data);
        } else {
          console.error('Search failed:', status);
        }
      });
    };

    const handleSearchInput = (e) => {
      const query = e.target.value;
      if (query.length > 2) {
        searchPlaces(query);
      } else {
        setSearchResults([]);
      }
    };

    const handleMapClick = (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      const lat = latlng.getLat();
      const lng = latlng.getLng();

      geocoder.coord2Address(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const address = result[0].address.address_name;
          alert(`Latitude: ${lat}, Longitude: ${lng}, Address: ${address}`);
        } else {
          alert(`Latitude: ${lat}, Longitude: ${lng}`);
        }
      });
    };

    window.kakao.maps.event.addListener(map, 'click', handleMapClick);
  };

  const handleSearch = (query) => {
    if (!mapsLoaded) {
      console.error('Kakao Maps API is not loaded');
      return;
    }

    const places = window.kakao.maps.services.Places;
    if (!places) {
      console.error('Places service is not available');
      return;
    }

    const ps = new places();
    ps.keywordSearch(query, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else {
        console.error('Search failed:', status);
      }
    });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    if (query.length > 2) {
      handleSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  const handlePlaceSelect = (place) => {
    setPostDetails(prevDetails => ({
      ...prevDetails,
      address: place.address_name,
      placeName: place.place_name
    }));
    setSearchResults([]);
  };

  return (
      <div className="container">
        <h3>게시물 작성하기</h3>
        <Form onSubmit={handleSavePost}>
          <div className="mb-3">
            <FloatingLabel controlId="floatingTitle" label="제목을 입력하세요">
              <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)} // 제목 상태 업데이트
                  placeholder="제목을 입력하세요"
                  required
              />
            </FloatingLabel>
          </div>

          <div className="mb-3">
            <FloatingLabel controlId="floatingSearch">
              <div ref={mapContainerRef} style={{ height: '400px', position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search for places"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{ position: 'absolute', top: '10px', left: '10px', zIndex: '1', width: 'calc(100% - 20px)', padding: '5px' }}
                />
              </div>
            </FloatingLabel>
          </div>

          <div>
            <input
                type="text"
                placeholder="방문할 장소를 검색하세요 (최소 3자이상 입력)"
                onChange={handleSearchChange}
                style={styles.input}
            />
            <ul style={styles.searchResultList}>
              {searchResults.map((place) => (
                  <li key={place.id}
                      onClick={() => handlePlaceSelect(place)}
                      onMouseEnter={() => handleMouseEnter(place.id)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        ...styles.searchResultItem,
                        ...(hoveredItemId === place.id
                            ? styles.searchResultItemHover : {}),
                      }}
                  >
                    {place.place_name} ({place.address_name})
                  </li>
              ))}
            </ul>
          </div>

          <div className="mb-3">
            <FloatingLabel controlId="floatingPlaceName" label="장소명">
              <Form.Control
                  type="text"
                  value={postDetails.placeName}
                  onChange={(e) => setPostDetails(prevDetails => ({
                    ...prevDetails,
                    placeName: e.target.value
                  }))}
                  placeholder="Place Name"
              />
            </FloatingLabel>
          </div>

          <div className="mb-3">
            <FloatingLabel controlId="floatingAddress" label="주소">
              <Form.Control
                  type="text"
                  value={postDetails.address}
                  onChange={(e) => setPostDetails(prevDetails => ({
                    ...prevDetails,
                    address: e.target.value
                  }))}
                  placeholder="Address"
              />
            </FloatingLabel>
          </div>

          <div className="mb-3">
            <FloatingLabel controlId="floatingSelectActivity" label="활동을 선택해주세요">
              <Form.Select
                  aria-label="Floating label select example"
                  value={postDetails.themeEnum}
                  onChange={(e) => setPostDetails(prevDetails => ({
                    ...prevDetails,
                    themeEnum: e.target.value
                  }))}
                  required
              >
                <option value="HEALING">힐링하고 싶어요</option>
                <option value="THRILL">스릴을 즐기고 싶어요</option>
                <option value="CAMPING">캠핑하고 싶어요</option>
                <option value="ACTIVITIES">활동적인거 하고 싶어요</option>
                <option value="FOOD_TOUR">먹고 싶어요</option>
                <option value="SHOPPING">쇼핑하고 싶어요</option>
                <option value="CULTURAL">문화생활 하고 싶어요</option>
                <option value="MARKET">마트에 가고 싶어요</option>
                <option value="NATURE">자연을 느끼고 싶어요</option>
                <option value="EXPERIENCE">체험 해보고 싶어요</option>
              </Form.Select>
            </FloatingLabel>
          </div>

          <div className="mb-3">
            <FloatingLabel controlId="floatingTextareaContent"
                           label="게시물 내용을 입력하세요">
              <Form.Control
                  as="textarea"
                  placeholder="게시물 내용"
                  value={content}
                  style={{ height: '200px' }}
                  onChange={(e) => setContent(e.target.value)}
                  required
              />
            </FloatingLabel>
          </div>

          <div className="mb-3">
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>이미지 업로드</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} />
            </Form.Group>
            {previewImage && (
                <div className="mb-3">
                  <img src={previewImage} alt="미리보기" style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
                </div>
            )}
          </div>

          <Button variant="primary" type="submit">
            게시물 작성하기
          </Button>
        </Form>
        <ToastContainer />
      </div>
  );
}

export default Posting;
