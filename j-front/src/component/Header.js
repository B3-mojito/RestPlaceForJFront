import React, { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import apiClient from '../helpers/apiClient'; // Ensure you have an API client set up for making API calls

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if the user is authenticated by checking for a token in local storage
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get('/users/myPage', {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const handleLogout = () => {
    // Remove tokens from local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    // Redirect to the home page after logging out
    window.location.href = '/';
  };

  return (
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">J의 안식처</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <div style={{ marginRight: '15px' }}>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {!isAuthenticated ? (
                    <>
                      <Nav.Link href="/login">로그인</Nav.Link>
                      <Nav.Link href="/signup">회원가입</Nav.Link>
                    </>
                ) : (
                    <>
                      {user && (
                          <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                            {user.profileImage && (
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '50%',
                                      marginRight: '10px',
                                    }}
                                />
                            )}
                            <span>{user.nickname} 님! 환영합니다!! </span>
                          </div>
                      )}
                      <Nav.Link href="/mypage">마이페이지</Nav.Link>
                      <Nav.Link onClick={handleLogout}>로그아웃</Nav.Link>
                    </>
                )}
              </Nav>
            </Navbar.Collapse>
          </div>
        </Container>
      </Navbar>
  );
}

export default Header;
