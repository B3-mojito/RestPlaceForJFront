import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/v1/users/login`, {
      username: email,
      password: password
    });
    localStorage.setItem('jwtToken', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed', error);
    throw error;
  }
};