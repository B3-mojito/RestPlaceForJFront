import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ toggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const token = response.headers.get('Authorization');
        const rToken = response.headers.get('RefreshToken');
        if (token && rToken) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('RefreshToken', rToken);
          navigate('/');
          toast.success('Login successful!');
        } else {
          console.error('Token not found in response headers');
          toast.error('Token not found');
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to sign in:', errorData.message);
        toast.error(`Failed to sign in: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      toast.error('Error during sign in');
    }
  };

  return (
      <>
        <Form onSubmit={handleSignIn}>
          <Form.Group className="mb-3" controlId="formGroupEmail">
            <Form.Group as={Col} controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </Form.Group>
          </Form.Group>
          <Button variant="primary" type="submit">
            로그인
          </Button>
        </Form>
        <ToastContainer />
      </>
  );
};

Login.propTypes = {
  toggle: PropTypes.func.isRequired,
};

export default Login;
