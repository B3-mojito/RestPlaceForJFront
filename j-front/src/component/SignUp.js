import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import PropTypes from 'prop-types';
import axios from "axios";
import {useNavigate} from "react-router-dom";
const SignUp = ({ toggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState(''); // State to hold error messages
  const navigate = useNavigate();
  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      // `axios.post` automatically converts the data object to JSON and sets the correct Content-Type header.
      const response = await axios.post('http://mojito-as-lb-1-346761212.ap-northeast-2.elb.amazonaws.com/v1/users', {
        email,
        password,
        name,
        nickname
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        console.log('SignUp response:', response.data);
        alert('회원가입 완료!');
        navigate('/login');
      } else {
        console.error('Failed to sign up:', response.data);
        alert(`Sign-up failed: ${response.data.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      alert('Network error occurred. Please try again later.');
    }
  };
  return (
      <Form onSubmit={handleSignUp}>
        {error && <div className="alert alert-danger">{error}</div>}
        <Row className="mb-3">
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="formNickname">
            <Form.Label>Nickname</Form.Label>
            <Form.Control
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
            />
          </Form.Group>

          <Form.Group as={Col} controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
          </Form.Group>
        </Row>

        <Button variant="primary" type="submit">
          가입하기
        </Button>
      </Form>
  );
};

// Define prop types
SignUp.propTypes = {
toggle: PropTypes.func.isRequired,
};

export default SignUp;