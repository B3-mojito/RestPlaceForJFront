import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom

const Login = ({ toggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Create a navigate function

  const handleSignIn = async (e) => {
    e.preventDefault();  // Prevent default form submission behavior

    try {
      const response = await fetch('/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('SignIn response:', data);

        // Check if token exists in the response
        if (data.token) {
          // Store the token in localStorage
          localStorage.setItem('jwtToken', data.token);

          // Redirect to the main screen
          navigate('/');  // Redirect to the main screen (or wherever you want)
        } else {
          console.error('Token not found in response');
          // Optionally show an error message to the user
        }
      } else {
        // Handle failed login
        console.error('Failed to sign in:', response.statusText);
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      // Optionally show an error message to the user
    }
  };

  return (
      <Form onSubmit={handleSignIn}>  {/* Add onSubmit handler to the Form */}
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
          가입하기
        </Button>
      </Form>
  );
};

Login.propTypes = {
  toggle: PropTypes.func.isRequired,
};

export default Login;