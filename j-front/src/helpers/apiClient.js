import axios from 'axios';
import { isTokenExpired } from '../utils/authUtils';
const apiClient = axios.create({
  baseURL: 'https://api.restplaceforj.com/v1',
  timeout : 1000,
});

const refreshToken = async () => {
  try {
    console.log("토큰 재발급")
    const response = await axios.post('https://api.restplaceforj.com/v1/users/reissue',{}, {
      headers: {
        refreshToken: localStorage.getItem('RefreshToken') // Assuming you're using JWT
      }
    });
    const newToken = response.headers.get('Authorization'); // Adjust based on your header name
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      return newToken;
    }
  } catch (error) {
    console.error('토큰 재발급 실패:', error.response.data.message);
    // Redirect to login page or handle error
    window.location.href = '/login';
    return null;
  }
};
// Request interceptor to handle token expiry
apiClient.interceptors.request.use(
    async (config) => {
      let token = localStorage.getItem('authToken');
      if (isTokenExpired(token)) {
        console.log("토큰만료")
        token = await refreshToken();
      }
      if (token) {
        config.headers['Authorization'] = `${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to retry requests after token refresh
apiClient.interceptors.response.use(
    response => response,
    async (error) => {
      if (error.response.status === 402) {
        // Token might be expired or invalid, try to refresh
        const newToken = await refreshToken();
        if (newToken) {
          // Retry the original request with the new token
          error.config.headers['Authorization'] = `${newToken}`;
          return apiClient.request(error.config);
        }
      }
      return Promise.reject(error);
    }
);

export default apiClient;