import React, { useState, useEffect } from 'react';
import { Button, FloatingLabel, Form, ListGroup, Pagination } from 'react-bootstrap';
import apiClient from '../helpers/apiClient';
function PostList() {
  const [region, setRegion] = useState('');
  const [theme, setTheme] = useState('');
  const [places, setPlaces] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const postsPerPage = 10;
  const token = localStorage.getItem('authToken');

  const regions = ["서울", "경기", "인천", "대전", "대구", "부산", "울산", "경남", "경북", "강원", "충남", "전남", "제주"];
  const themes = [
    { value: "HEALING", label: "힐링하고 싶어요" },
    { value: "THRILL", label: "스릴을 즐기고 싶어요" },
    { value: "CAMPING", label: "캠핑하고 싶어요" },
    { value: "ACTIVITIES", label: "활동적인 거 하고 싶어요" },
    { value: "FOOD_TOUR", label: "먹고 싶어요" },
    { value: "SHOPPING", label: "쇼핑하고 싶어요" },
    { value: "CULTURAL", label: "문화생활 하고 싶어요" },
    { value: "MARKET", label: "마트에 가고 싶어요" },
    { value: "NATURE", label: "자연을 느끼고 싶어요" },
    { value: "EXPERIENCE", label: "체험해보고 싶어요" }
  ];

  const fetchPlaces = async (page) => {
    try {
      const response = await apiClient.get(`/posts/place-name?region=${region}&theme=${theme}&page=${page - 1}&size=${postsPerPage}`,
          {
            headers: {
              'Authorization': `${token}`, // Include the token in the Authorization header
              'Content-Type': 'application/json'
            }
          });

      const result = await response.json();
      if (result && result.data) {
        const { contentList, totalPages } = result.data;
        setPlaces(contentList || []);
        setTotalPages(totalPages || 1);
      } else {
        console.error('Expected data object but received:', result);
        setPlaces([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlaces([]);
      setTotalPages(0);
    }
  };

  const fetchPosts = async (page, placeName, sortBy) => {
    try {
      console.log(`Fetching posts for place: ${placeName}, sort by: ${sortBy}, page: ${page}`);
      const response = await apiClient.patch(`/posts?place-name=${placeName}&sort-by=${sortBy}&page=${page - 1}&size=${postsPerPage}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `${token}`, // Include the token in the Authorization header
              'Content-Type': 'application/json'
            }
          });

      const result = await response.json();
      console.log('API Response:', result); // 디버깅용 로그
      if (result && result.data) {
        const { contentList, totalPages } = result.data;
        setPosts(contentList || []);
        setTotalPages(totalPages || 1);
      } else {
        console.error('Expected data object but received:', result);
        setPosts([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setTotalPages(0);
    }
  };
  useEffect(() => {
    fetchPlaces(currentPage);
  }, [currentPage, region, theme]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPlaces(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (selectedPlace) {
      fetchPosts(pageNumber, selectedPlace, sortBy);
    } else {
      fetchPlaces(pageNumber);
    }
  };

  const handlePlaceClick = (placeName) => {
    setSelectedPlace(placeName);
    setCurrentPage(1);
    fetchPosts(1, placeName, sortBy);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    if (selectedPlace) {
      fetchPosts(1, selectedPlace, e.target.value);
    }
  };

  return (
      <div>
        <div>
          <h3>여행하시려는 지역이 어디인가요?</h3>
          <FloatingLabel controlId="floatingSelectRegion" label="지역을 선택해주세요">
            <Form.Select aria-label="Select Region" onChange={(e) => setRegion(e.target.value)}>
              <option value="">지역을 선택하세요</option>
              {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
              ))}
            </Form.Select>
          </FloatingLabel>
        </div>
        <div>
          <h3>어떤 것을 하고 싶으세요?</h3>
          <FloatingLabel controlId="floatingSelectTheme" label="테마를 선택해주세요">
            <Form.Select aria-label="Select Theme" onChange={(e) => setTheme(e.target.value)}>
              <option value="">테마를 선택하세요</option>
              {themes.map((theme) => (
                  <option key={theme.value} value={theme.value}>{theme.label}</option>
              ))}
            </Form.Select>
          </FloatingLabel>
        </div>
        <div className="d-grid gap-2 mt-3">
          <Button variant="primary" size="lg" onClick={handleSearch}>
            찾아보기
          </Button>
        </div>
        <div>
          <h3>검색 결과</h3>
          {places.length > 0 ? (
              <ListGroup as="ul" numbered>
                {places.map((place, index) => (
                    <ListGroup.Item as="li" key={index}>
                      <Button variant="link" onClick={() => handlePlaceClick(place)}>
                        {place}
                      </Button>
                    </ListGroup.Item>
                ))}
              </ListGroup>
          ) : (
              <p>조건에 맞는 게시물이 없습니다.</p>
          )}
        </div>
        {selectedPlace && (
            <div>
              <h3>{selectedPlace}의 게시물</h3>
              <Form.Group controlId="sortBySelect">
                <Form.Label>정렬 기준:</Form.Label>
                <Form.Control as="select" value={sortBy} onChange={handleSortChange}>
                  <option value="createdAt">최신순</option>
                  <option value="viewsCount">조회순</option>
                  <option value="likesCount">추천순</option>
                </Form.Control>
              </Form.Group>
              <ListGroup as="ul" numbered>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <ListGroup.Item as="li" key={index}>
                          <h4>{post.title}</h4>
                        </ListGroup.Item>
                    ))
                ) : (
                    <p>게시물이 없습니다.</p>
                )}
              </ListGroup>
              <Pagination>
                {[...Array(totalPages).keys()].map(number => (
                    <Pagination.Item key={number} active={number + 1 === currentPage} onClick={() => handlePageChange(number + 1)}>
                      {number + 1}
                    </Pagination.Item>
                ))}
              </Pagination>
            </div>
        )}
      </div>
  );
}

export default PostList;