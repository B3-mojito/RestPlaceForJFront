import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Pagination, Form } from 'react-bootstrap';
import apiClient from '../helpers/apiClient';
import './PostList.css'; // Assuming you will create this CSS file for custom styles

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
    { value: "HEALING", label: "힐링하고 싶어요 😌" },
    { value: "THRILL", label: "스릴을 즐기고 싶어요 😎" },
    { value: "CAMPING", label: "캠핑하고 싶어요 🏕️" },
    { value: "ACTIVITIES", label: "활동적인 거 하고 싶어요 🎢" },
    { value: "FOOD_TOUR", label: "맛집투어를 하고 싶어요 🍲" },
    { value: "SHOPPING", label: "쇼핑하고 싶어요 🛍️" },
    { value: "CULTURAL", label: "문화생활을 하고 싶어요 🎭" },
    { value: "MARKET", label: "야시장이 가고 싶어요 🛒" },
    { value: "NATURE", label: "자연을 느끼고 싶어요 🌳" },
    { value: "EXPERIENCE", label: "체험해보고 싶어요 👨‍🔧" }
  ];

  useEffect(() => {
    if (region && theme) {
      fetchPlaces(currentPage);
    }
  }, [currentPage, region, theme]);

  const fetchPlaces = async (page) => {
    try {
      const response = await apiClient.get(`/posts/place-name?region=${region}&theme=${theme}&page=${page - 1}&size=${postsPerPage}`, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result && result.data) {
        const { contentList, totalPages } = result.data;
        setPlaces(contentList || []);
        setTotalPages(totalPages || 1);
      } else {
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
      const response = await apiClient.get(`/posts?place-name=${placeName}&sort-by=${sortBy}&page=${page - 1}&size=${postsPerPage}`, {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result && result.data) {
        const { contentList, totalPages } = result.data;
        setPosts(contentList || []);
        setTotalPages(totalPages || 1);
      } else {
        setPosts([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setTotalPages(0);
    }
  };

  const handleRegionClick = (selectedRegion) => {
    setRegion(selectedRegion);
    setCurrentPage(1);
    setSelectedPlace(''); // Reset selected place when region is changed
    if (selectedRegion && theme) {
      fetchPlaces(1); // Fetch places if both region and theme are selected
    }
  };

  const handleThemeClick = (selectedTheme) => {
    setTheme(selectedTheme);
    setCurrentPage(1);
    setSelectedPlace(''); // Reset selected place when theme is changed
    if (region && selectedTheme) {
      fetchPlaces(1); // Fetch places if both region and theme are selected
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (selectedPlace) {
      fetchPosts(pageNumber, selectedPlace, sortBy);
    } else if (region && theme) {
      fetchPlaces(pageNumber);
    }
  };

  return (
      <div className="post-list-container">
        <div className="section">
          <h3 className="section-title">여행하시려는 지역이 어디인가요? <span className="emoji">😃</span></h3>
          <div className="region-buttons">
            {regions.map((regionOption) => (
                <Button
                    key={regionOption}
                    variant="outline-secondary"
                    onClick={() => handleRegionClick(regionOption)}
                    className={`region-button ${regionOption === region ? 'active' : ''}`}
                >
                  {regionOption}
                </Button>
            ))}
          </div>
        </div>
        <div className="section">
          <h3 className="section-title">어떤 것을 하고 싶으세요?</h3>
          <div className="theme-buttons">
            {themes.map((themeOption) => (
                <Button
                    key={themeOption.value}
                    variant="outline-secondary"
                    onClick={() => handleThemeClick(themeOption.value)}
                    className={`theme-button ${themeOption.value === theme ? 'active' : ''}`}
                >
                  {themeOption.label}
                </Button>
            ))}
          </div>
        </div>
        <div className="places-section">
          <h3 className="section-title">이곳은 어떠세요?</h3>
          {places.length > 0 ? (
              <ListGroup as="ul" className="place-list">
                {places.map((place, index) => (
                    <ListGroup.Item as="li" key={index} className="place-list-item">
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
            <div className="posts-section">
              <h3>{selectedPlace}의 게시물</h3>
              <Form.Group controlId="sortBySelect">
                <Form.Label>정렬 기준:</Form.Label>
                <Form.Control as="select" value={sortBy} onChange={handleSortChange}>
                  <option value="createdAt">최신순</option>
                  <option value="viewsCount">조회순</option>
                  <option value="likesCount">추천순</option>
                </Form.Control>
              </Form.Group>
              <ListGroup as="ul" className="post-list">
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
