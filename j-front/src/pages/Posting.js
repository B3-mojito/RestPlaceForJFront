import React, {useEffect, useRef, useState} from "react";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function Posting() {
  const [region, setRegion] = useState('');
  const [activity, setActivity] = useState('');
  const [content, setContent] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const loadKakaoMapsScript = () => {
      const script = document.createElement('script');
      script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=a84090a0ae739cccb8c34d58fca902b1&autoload=false&libraries=services';
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          initializeKakaoMap();
        });
      };
      script.onerror = () => {
        console.error('Failed to load Kakao Maps API script.');
      };
      document.head.appendChild(script);
    };

    loadKakaoMapsScript();

    // Clean up the script on component unmount
    return () => {
      const script = document.querySelector(`script[src*="dapi.kakao.com"]`);
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeKakaoMap = () => {
    const container = mapContainerRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // Default center (Seoul)
      level: 3
    };
    const map = new window.kakao.maps.Map(container, options);

    const places = new window.kakao.maps.services.Places();

    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = '검색어를 입력하세요';
    searchBox.style.position = 'absolute';
    searchBox.style.top = '10px';
    searchBox.style.left = '10px';
    searchBox.style.zIndex = '1';
    container.appendChild(searchBox);
    searchInputRef.current = searchBox;

    searchBox.addEventListener('input', () => {
      const query = searchBox.value;
      if (query) {
        places.keywordSearch(query, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            setSearchResults(data);
          } else {
            setSearchResults([]);
          }
        });
      } else {
        setSearchResults([]);
      }
    });

    const searchResultsContainer = document.createElement('ul');
    searchResultsContainer.style.position = 'absolute';
    searchResultsContainer.style.top = '40px';
    searchResultsContainer.style.left = '10px';
    searchResultsContainer.style.width = '300px';
    searchResultsContainer.style.maxHeight = '150px';
    searchResultsContainer.style.overflowY = 'auto';
    searchResultsContainer.style.backgroundColor = '#fff';
    searchResultsContainer.style.border = '1px solid #ccc';
    searchResultsContainer.style.zIndex = '2';
    container.appendChild(searchResultsContainer);

    searchResultsContainer.addEventListener('click', (e) => {
      const target = e.target;
      if (target.tagName === 'LI') {
        const place = JSON.parse(target.dataset.place);
        setRegion(place.address_name);
        setSearchResults([]);

        const marker = new window.kakao.maps.Marker({
          map: map,
          position: new window.kakao.maps.LatLng(place.y, place.x),
          title: place.place_name
        });
        map.setCenter(new window.kakao.maps.LatLng(place.y, place.x));
      }
    });
  };

  useEffect(() => {
    if (searchInputRef.current) {
      const resultsContainer = mapContainerRef.current.querySelector('ul');
      if (resultsContainer) {
        resultsContainer.innerHTML = searchResults.map((place) => `
          <li data-place='${JSON.stringify(place)}' style="padding: 10px; cursor: pointer; border-bottom: 1px solid #ddd;">
            ${place.place_name}
          </li>
        `).join('');
      }
    }
  }, [searchResults]);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      region,
      activity,
      content
    });

    setRegion('');
    setActivity('');
    setContent('');
    setSearchResults([]);
  };

  return (
      <div className="container">
        <h3>게시물 작성하기</h3>
        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            <FloatingLabel controlId="floatingSearch">
              <div ref={mapContainerRef} style={{ height: '400px', position: 'relative' }}></div>
            </FloatingLabel>
          </div>
          <div className="mb-3">
            <FloatingLabel controlId="floatingSelectActivity" label="활동을 선택해주세요">
              <Form.Select
                  aria-label="Floating label select example"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  required
              >
                <option value="">활동을 선택하세요</option>
                <option value="힐링">힐링하고 싶어요</option>
                <option value="스릴">스릴을 즐기고 싶어요</option>
                <option value="캠핑">캠핑하고 싶어요</option>
              </Form.Select>
            </FloatingLabel>
          </div>
          <div className="mb-3">
            <FloatingLabel controlId="floatingTextareaContent" label="게시물 내용을 입력하세요">
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
          <Button variant="primary" type="submit">
            게시물 작성하기
          </Button>
        </Form>
      </div>
  );
}

export default Posting;