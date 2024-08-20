import React, { useEffect } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import {useAuth} from "../context/AuthProvider";
import apiClient from '../helpers/apiClient';

function Header() {
  const { isAuthenticated, user, login, logout } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get('/users/myPage', {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      login(response.data.data);
    } catch (error) {
      console.error(error.response.data.message);
    }
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
                      <Nav.Link onClick={logout}>로그아웃</Nav.Link>
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

