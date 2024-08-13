import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUp.css'; // Import the CSS file for additional styling

const SignUp = ({ toggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/v1/users', {
        email,
        password,
        name,
        nickname
      });

      if (response.status === 200) {
        alert('회원가입 완료!');
        navigate('/login');
      } else {
        alert(`Sign-up failed: ${response.data.message || response.statusText}`);
      }
    } catch (error) {
      alert('Network error occurred. Please try again later.');
    }
  };

  return (
      <div className="signup-container">
        <div className="left-panel">
          <h2>&#39;J의 안식처&#39;의 회원이 되어주세요!</h2>
        </div>
        <div className="right-panel">
          <Form onSubmit={handleSignUp}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                  type="password"
                  placeholder="영문, 숫자, 특수기호 포함 8~15자의 패스워드"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </Form.Group>

            <Form.Group controlId="formNickname" className="mb-3">
              <Form.Label>Nickname</Form.Label>
              <Form.Control
                  type="text"
                  placeholder="닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
              />
            </Form.Group>

            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
              />
            </Form.Group>

            <Button variant="success" type="submit" className="signup-button">
              가입하기
            </Button>
          </Form>
        </div>
      </div>
  );
};

SignUp.propTypes = {
  toggle: PropTypes.func.isRequired,
};

export default SignUp;
