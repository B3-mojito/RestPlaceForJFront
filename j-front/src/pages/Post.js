import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import {ListGroup} from "react-bootstrap";

function Post() {
  // State to manage selected options
  const [region, setRegion] = useState('');
  const [activity, setActivity] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  // Sample data for posts
  const posts = [
    { id: 1, region: '서울', activity: '힐링', content: '서울에서 힐링하기 좋은 곳!' },
    { id: 2, region: '대구', activity: '스릴', content: '대구에서 스릴 넘치는 활동!' },
    { id: 3, region: '부산', activity: '캠핑', content: '부산에서 즐기는 캠핑!' },
    { id: 4, region: '서울', activity: '스릴', content: '서울에서 스릴 넘치는 활동!' },
    { id: 5, region: '대구', activity: '힐링', content: '대구에서 힐링하기 좋은 곳!' },
    { id: 6, region: '부산', activity: '캠핑', content: '부산에서 즐기는 캠핑!' },
    { id: 7, region: '서울', activity: '힐링', content: '서울에서 힐링하기 좋은 곳!' },
    { id: 8, region: '대구', activity: '스릴', content: '대구에서 스릴 넘치는 활동!' },
    { id: 9, region: '부산', activity: '캠핑', content: '부산에서 즐기는 캠핑!' },
    { id: 10, region: '서울', activity: '힐링', content: '서울에서 힐링하기 좋은 곳!' },
    { id: 11, region: '대구', activity: '스릴', content: '대구에서 스릴 넘치는 활동!' },
    { id: 12, region: '부산', activity: '캠핑', content: '부산에서 즐기는 캠핑!' },
    // Add more posts as needed
  ];
  // Handle select changes
  const handleRegionChange = (e) => {
    setRegion(e.target.value);
  };

  const handleActivityChange = (e) => {
    setActivity(e.target.value);
  };

  // Filter posts based on selected values
  const handleSearch = () => {
    const results = posts.filter(post =>
        (region ? post.region === region : true) &&
        (activity ? post.activity === activity : true)
    );
    setFilteredPosts(results);
    setCurrentPage(1);
  };

  // Get posts for the current page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination controls
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredPosts.length / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
      <div>
        <div>
          <h3>여행하시려는 지역이 어디 인가요?</h3>
          <FloatingLabel controlId="floatingSelect" label="지역을 선택해주세요">
            <Form.Select aria-label="Floating label select example"
                         onChange={handleRegionChange}>
              <option>지역을 선택하세요</option>
              <option value="서울">서울</option>
              <option value="대구">대구</option>
              <option value="부산">부산</option>
            </Form.Select>
          </FloatingLabel>
        </div>
        <div>
          <h3>어떤 것을 하고 싶으세요?</h3>
          <FloatingLabel controlId="floatingSelect" label="지역을 선택해주세요">
            <Form.Select aria-label="Floating label select example"
                         onChange={handleActivityChange}>
              <option>지역을 선택하세요</option>
              <option value="힐링">힐링하고 싶어요</option>
              <option value="스릴">스릴을 즐기고 싶어요</option>
              <option value="캠핑">캠핑하고 싶어요</option>
            </Form.Select>
          </FloatingLabel>
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
                {filteredPosts.map(post => (
                    <ListGroup.Item as="li" key={post.id}>
                      <h4>{post.region} - {post.activity}</h4>
                      <p>{post.content}</p>
                      <Button variant="primary">자세히 보기</Button>
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
                  <li key={number} className="page-item">
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
      </div>
  );
}

export default Post;