import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer from react-toastify
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ toggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Create a navigate function

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
        // Log all response headers
        console.log('Response headers:', [...response.headers]);

        // Get the token from the headers
        const token = response.headers.get('Authorization');

        if (token) {
          console.log('Token found:', token);

          // Store the token in localStorage
          localStorage.setItem('authToken', token);

          // Redirect to the home page
          navigate('/'); // Use navigate from react-router-dom
          toast.success('Login successful!');
        } else {
          console.error('Token not found in response headers');
          toast.error('Token not found');
        }
      } else {
        console.error('Failed to sign in:', response.statusText);
        toast.error('Failed to sign in');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      toast.error('Error during sign in');
    }
  };

  return (
      <>
        <Form onSubmit={handleSignIn}> {/* Add onSubmit handler to the Form */}
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
        <ToastContainer /> {/* Add ToastContainer to your component tree */}
      </>
  );
};

Login.propTypes = {
  toggle: PropTypes.func.isRequired,
};

export default Login;