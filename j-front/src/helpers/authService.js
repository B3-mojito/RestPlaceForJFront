import axios from 'axios';

const API_URL = 'http://mojito-as-lb-1-346761212.ap-northeast-2.elb.amazonaws.com';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/v1/users/login`, {
      username: email,
      password: password
    });
    localStorage.setItem('authToken', response.data);
    return response.data;
  } catch (error) {
    console.error('Login failed', error);
    throw error;
  }
};