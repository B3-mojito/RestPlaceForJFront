import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { ListGroup, Modal } from 'react-bootstrap';

function Post() {
  const [region, setRegion] = useState('');
  const [activity, setActivity] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [postDetails, setPostDetails] = useState(null); // State to hold post details
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const postsPerPage = 10;

  // Handle select changes
  const handleRegionChange = (e) => setRegion(e.target.value);
  const handleActivityChange = (e) => setActivity(e.target.value);

  // Fetch posts from backend
  const fetchPosts = async (page) => {
    try {
      const response = await fetch(`http://localhost:8080/v1/posts/place-name?region=${region}&theme=${activity}&page=${page-1}&size=${postsPerPage}`);
      const result = await response.json();
      if (result && result.data) {
        const { contentList, totalPages } = result.data;
        setFilteredPosts(contentList || []);
        setTotalPages(totalPages || 1);
      } else {
        console.error('Expected data object but received:', result);
        setFilteredPosts([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error during fetch posts:', error);
      setFilteredPosts([]);
      setTotalPages(0);
    }
  };

  const fetchPostDetails = async (placeName) => {
    try {
      // Build query parameters
      const query = new URLSearchParams({
        'place-name': placeName, // Required parameter

      }).toString();

      // Log the query for debugging
      console.log(`Fetching post details with query: ${query}`);

      // Make the fetch request with query parameters
      const response = await fetch(`http://localhost:8080/v1/posts?${query}`);

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        console.error('Server returned an error:', errorData);
        setPostDetails(null);
        return;
      }

      const result = await response.json();

      if (result && result.data) {
        setPostDetails(result.data);
        setShowModal(true);
      } else {
        console.error('Expected data object but received:', result);
        setPostDetails(null);
      }
    } catch (error) {
      console.error('Error during fetch post details:', error);
      setPostDetails(null);
    }
  };
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, region, activity]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPosts(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchPosts(pageNumber);
  };

  const handleViewDetails = (post) => {
    // Fetch detailed information about the selected post
    fetchPostDetails(post);
  };

  const handleCloseModal = () => setShowModal(false);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
      <div>
        <div>
          <h3>여행하시려는 지역이 어디 인가요?</h3>
          <FloatingLabel controlId="floatingSelect" label="지역을 선택해주세요">
            <Form.Select aria-label="Floating label select example"
                         onChange={handleRegionChange}>
              <option value="">지역을 선택하세요</option>
              <option value="서울">서울</option>
              <option value="대구">대구</option>
              <option value="부산">인천</option>
              <option value="부산">대전</option>
              <option value="부산">부산</option>
              <option value="부산">강원</option>
              <option value="부산">울산</option>
              <option value="부산">경남</option>
              <option value="부산">경북</option>
              <option value="부산">전남</option>
              <option value="부산">전북</option>
              <option value="부산">제주</option>
              <option value="부산">경기</option>
            </Form.Select>
          </FloatingLabel>
        </div>
        <div>
          <h3>어떤 것을 하고 싶으세요?</h3>
          <FloatingLabel controlId="floatingSelect" label="테마를 선택해주세요">
            <Form.Select aria-label="Floating label select example"
                         onChange={handleActivityChange}>
              <option value="">테마를 선택하세요</option>
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
          {['radio'].map((type) => (
              <div key={`inline-${type}`} className="mb-3">
                <Form.Check
                    inline
                    label="최신순"
                    name="나열방법"
                    type={type}
                    id={`inline-${type}-1`}
                />
                <Form.Check
                    inline
                    label="조회순"
                    name="나열방법"
                    type={type}
                    id={`inline-${type}-2`}
                />
                <Form.Check
                    inline
                    label="추천순"
                    name="나열방법"
                    type={type}
                    id={`inline-${type}-3`}
                />
              </div>
          ))}
        </div>
        <div className="d-grid gap-2">
          <Button variant="primary" size="lg" onClick={handleSearch}>
            찾아보기
          </Button>
        </div>
        <div>
          <h3>검색 결과</h3>
          {filteredPosts.length > 0 ? (
              <ListGroup as="ul" numbered>
                {filteredPosts.map((post, index) => (
                    <ListGroup.Item as="li" key={index}>
                      <h4>{post}</h4>
                      <Button variant="primary" onClick={() => handleViewDetails(post)}>
                        자세히 보기
                      </Button>
                    </ListGroup.Item>
                ))}
              </ListGroup>
          ) : (
              <p>조건에 맞는 게시물이 없습니다.</p>
          )}
        </div>
        <div>
          <nav>
            <ul className="pagination">
              {pageNumbers.map(number => (
                  <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                    <Button
                        className="page-link"
                        onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </Button>
                  </li>
              ))}
            </ul>
          </nav>
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Post Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {postDetails ? (
                <div>
                  <h4>{postDetails.title}</h4>
                  <p>{postDetails.content}</p>
                  {/* Add more details as needed */}
                </div>
            ) : (
                <p>Loading...</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
  );
}

export default Post;