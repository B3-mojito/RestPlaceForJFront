import React, { useState, useEffect } from 'react';
import { Button, FloatingLabel, Form, ListGroup, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiClient from '../helpers/apiClient';
import './PostList.css'; // Import custom CSS for additional styling

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
  const navigate = useNavigate();
  const [q, setQ] = useState('');

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
      const response = await apiClient.get(`/posts/place-name?region=${region}&theme=${theme}&page=${page - 1}&size=${postsPerPage}`, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;

      if (result && result.data && result.data.contentList) {
        const { contentList, totalPages } = result.data;
        setPlaces(contentList);
        setTotalPages(totalPages);
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
      const response = await apiClient.get(`/posts?place-name=${placeName}&sort-by=${sortBy}&page=${page - 1}&size=${postsPerPage}&q=${q}`, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;

      if (result && result.data && result.data.contentList) {
        const { contentList, totalPages } = result.data;
        setPosts(contentList);
        setTotalPages(totalPages);
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
    fetchPosts(currentPage, selectedPlace, e.target.value);
  };

  const handlePostClick = (post) => {
    navigate(`/posts/${post.id}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setCurrentPage(1);
      fetchPosts(1, selectedPlace, sortBy);
    }
  };

  return (
      <div className="post-list-container">
        <div className="region-selection">
          <h3>여행하시려는 지역이 어디인가요? 😊</h3>
          <FloatingLabel controlId="floatingSelectRegion" label="지역을 선택해주세요">
            <Form.Select aria-label="Select Region" onChange={(e) => setRegion(e.target.value)}>
              <option value="">지역을 선택하세요</option>
              {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
              ))}
            </Form.Select>
          </FloatingLabel>
        </div>

        <div className="theme-selection">
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

        <div className="search-button">
          <Button variant="success" size="lg" onClick={handleSearch} className="rounded-pill">
            찾아보기
          </Button>
        </div>

        <div className="search-results">
          <h3>이곳은 어떠세요?</h3>
          {places.length > 0 ? (
              <ListGroup as="ul" numbered>
                {places.map((place, index) => (
                    <ListGroup.Item as="li" key={index}>
                      <Button variant="link" onClick={() => handlePlaceClick(place)} className="place-link">
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
            <div className="place-posts">
              <h3>{selectedPlace}의 게시물</h3>
              <FloatingLabel controlId="sortBySelect"
                             label="정렬 기준을 선택해주세요">
                <Form.Select as="select" value={sortBy}
                              onChange={handleSortChange}
                              className="sort-select">
                  <option value="createdAt">최신순</option>
                  <option value="viewsCount">조회순</option>
                  <option value="likesCount">추천순</option>
                </Form.Select>
              </FloatingLabel>

              <h3>검색어를 입력하세요</h3>
              <Form.Group controlId="searchTitleByQ">
                <Form.Control
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="검색어를 입력하세요"
                    onKeyPress={handleKeyPress}
                    className="search-input"
                />
              </Form.Group>

              <ListGroup as="ul" numbered>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <ListGroup.Item as="li" key={index}
                                        onClick={() => handlePostClick(post)}
                                        className="post-item">
                          <h4>{post.title}</h4>
                        </ListGroup.Item>
                    ))
                ) : (
                    <p>게시물이 없습니다.</p>
                )}
              </ListGroup>

              <Pagination className="pagination-container">
                {[...Array(totalPages).keys()].map(number => (
                    <Pagination.Item key={number}
                                     active={number + 1 === currentPage}
                                     onClick={() => handlePageChange(
                                         number + 1)}>
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
