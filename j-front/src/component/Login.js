import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const Login = ({ toggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://api.restplaceforj.com/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const token = response.headers.get('Authorization');

        if (token) {
          localStorage.setItem('authToken', token);
          navigate('/');
          toast.success('Login successful!');
        } else {
          toast.error('Token not found');
        }
      } else {
        toast.error('Failed to sign in');
      }
    } catch (error) {
      toast.error('Error during sign in');
    }
  };

  const handleKakaoLogin = () => {
    // Kakao login logic here
    toast.info('Kakao login clicked!');
  };

  return (
      <>
        <div className="login-container">
          <div className="left-panel">
            <h2>&#39;J의 안식처&#39;에 오신걸 환영해요!</h2>
          </div>
          <div className="right-panel">
            <Form onSubmit={handleSignIn}>
              <Form.Group className="mb-3" controlId="formGroupEmail">
                <Form.Group as={Col} controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                      type="email"
                      placeholder="이메일"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
                </Form.Group>
                <Form.Group as={Col} controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                      type="password"
                      placeholder="패스워드"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                  />
                </Form.Group>
              </Form.Group>
              <Button variant="success" type="submit" className="login-button">
                로그인
              </Button>
              <Button
                  variant="warning"
                  className="kakao-login-button mt-3"
                  onClick={handleKakaoLogin}
              >
                카카오 로그인
              </Button>
            </Form>
          </div>
        </div>
        <ToastContainer />
      </>
  );
};

Login.propTypes = {
  toggle: PropTypes.func.isRequired,
};

export default Login;
