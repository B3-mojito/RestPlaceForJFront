import React, {useEffect, useRef, useState} from "react";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import apiClient from "../helpers/apiClient";
import {useNavigate, useParams} from "react-router-dom";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditPost() {
  const { postId } = useParams();  // Get the post ID from the URL
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [postDetails, setPostDetails] = useState({
    address: '',
    placeName: '',
    themeEnum: ''
  });
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const mapContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const response = await apiClient.get('/users/me', {
          headers: {
            Authorization: `${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        setLoggedInUserId(response.data.data.userId);
      } catch (error) {
        console.error(error.response.data.message);
      }
    };

    fetchLoggedInUser();
  }, []);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!loggedInUserId) return;

      try {
        const response = await apiClient.get(`/posts/${postId}`, {
          headers: {
            Authorization: `${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        const postData = response.data.data;
        setTitle(postData.title);
        setContent(postData.content);
        setPostDetails({
          address: postData.address,
          placeName: postData.placeName,
          themeEnum: postData.themeEnum
        });
        if (postData.imageList && postData.imageList.length > 0) {
          setPreviewImage(postData.imageList[0].imageUrl);
        }

        // Redirect to home if the logged-in user is not the author
        if (postData.userId !== loggedInUserId) {
          alert('접근 권한이 없습니다.');
          navigate('/');
        }
      } catch (error) {
        console.error(error.response.data.message);
      }
    };

    if (loggedInUserId) {
      fetchPostDetails();
    }
    loadKakaoMapsScript();
  }, [postId, loggedInUserId, navigate]);

  useEffect(() => {
    if (mapsLoaded && mapContainerRef.current) {
      // Initialize Kakao Maps
      const mapContainer = mapContainerRef.current;
      const mapOptions = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 3
      };

      const map = new window.kakao.maps.Map(mapContainer, mapOptions);
      const ps = new window.kakao.maps.services.Places();
      const geocoder = new window.kakao.maps.services.Geocoder();

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
            console.error('Failed to get address from coordinates:', status);
          }
        });
      };

      window.kakao.maps.event.addListener(map, 'click', handleMapClick);
    }
  }, [mapsLoaded]);

  const loadKakaoMapsScript = () => {
    const scriptUrl = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=f90abf763c49b09ee81cd9b1f5f0b3ef&libraries=services,clusterer,drawing&autoload=false";

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
          console.log('맵 로드 성공');
        });
      };
      script.onerror = () => {
        console.error('맵 호출 실패');
      };
      document.body.appendChild(script);
    } else {
      console.log('카카오 맵이 이미 로드 되었습니다.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSavePost = async (e) => {
    e.preventDefault();

    try {
      let imageId = null;

      // Upload image if a new one is selected
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
          imageId = imageResponse.data.data.id;
        }
      }

      // Update the post
      const postPayload = {
        title: title,
        content: content,
        address: postDetails.address,
        placeName: postDetails.placeName,
        theme: postDetails.themeEnum,
        imageIdList: imageId ? [imageId] : []  // Use new image if uploaded
      };

      const postResponse = await apiClient.patch(`/posts/${postId}`, postPayload, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });

      if (postResponse.data && postResponse.data.data) {
        alert('게시물이 성공적으로 수정되었습니다!');
        navigate(`/posts/${postId}`);
      }
    } catch (error) {
      console.error('Failed to update post:', error.response.data.message);
      alert('게시물 수정에 실패했습니다.' + error.response.data.message);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      handleSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearch = (query) => {
    if (!mapsLoaded) {
      console.error('맵이 로드되지않음.');
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(query, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else {
        console.error('Search failed:', status);
      }
    });
  };

  const handlePlaceSelect = (place) => {
    setPostDetails(prevDetails => ({
      ...prevDetails,
      address: place.address_name,
      placeName: place.place_name
    }));
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCancel = () => {
    navigate(`/posts/${postId}`);
  };

  return (
      <div className="container">
        <h3>게시물 수정하기</h3>
        <Form onSubmit={handleSavePost}>
          <div className="mb-3">
            <FloatingLabel controlId="floatingTitle" label="제목을 입력하세요">
              <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  required
              />
            </FloatingLabel>
          </div>

          <div className="mb-3">
            <FloatingLabel controlId="floatingSearch">
              <div ref={mapContainerRef}
                   style={{ height: '400px', position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search for places"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      zIndex: '1',
                      width: 'calc(100% - 20px)',
                      padding: '5px'
                    }}
                />
              </div>
            </FloatingLabel>
          </div>

          <div>
            <input
                type="text"
                placeholder="Search for places"
                onChange={handleSearchChange}
            />
            <ul>
              {searchResults.map((place) => (
                  <li key={place.id} onClick={() => handlePlaceSelect(place)}>
                    {place.place_name} ({place.address_name})
                  </li>
              ))}
            </ul>
          </div>

          <div className="mb-3">
            <FloatingLabel controlId="floatingPlaceName" label="Place Name">
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
            <FloatingLabel controlId="floatingAddress" label="Address">
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
            <FloatingLabel controlId="floatingSelectActivity"
                           label="활동을 선택해주세요">
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
              <Form.Label>프로필 이미지 업로드</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} />
            </Form.Group>
            {previewImage && (
                <div className="mb-3">
                  <img src={previewImage} alt="미리보기" style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'cover'
                  }} />
                </div>
            )}
          </div>

          <div className="d-flex justify-content-between">
            <Button variant="primary" type="submit">
              게시물 수정하기
            </Button>
            <Button variant="secondary" type="button" onClick={handleCancel}>
              취소
            </Button>
          </div>
        </Form>
        <ToastContainer />
      </div>
  );
}

export default EditPost;
