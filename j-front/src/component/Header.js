import React, { useEffect, useState } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 authToken 확인
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    // 로컬 스토리지에서 authToken 삭제
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    // 로그아웃 후 리디렉션
    window.location.href = '/';
  };

  return (
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">J의 안식처</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/plan">계획 짜기</Nav.Link>
              <Nav.Link href="/post">추천 게시물 보기</Nav.Link>
              <NavDropdown title="메뉴" id="basic-nav-dropdown">
                {!isAuthenticated ? (
                    <>
                      <NavDropdown.Item href="/login">로그인</NavDropdown.Item>
                      <NavDropdown.Item href="/signup">회원가입</NavDropdown.Item>
                    </>
                ) : (
                    <>
                      <NavDropdown.Item href="/mypage">마이페이지</NavDropdown.Item>
                      <NavDropdown.Item onClick={handleLogout}>로그아웃</NavDropdown.Item>
                    </>
                )}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
}

export default Header;