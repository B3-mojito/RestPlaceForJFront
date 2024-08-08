import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const authToken = async () => {
try {
  const response = await axios.post('http://localhost:8080/v1/users/reissue', {
    authToken: localStorage.getItem('authToken'),
  });

  if (!response.data || !response.data.data) {
    throw new Error('Token refresh failed');
  }

  const {authToken} = response.data.data;

  // Store new tokens
  localStorage.setItem('authToken', authToken);

  return authToken;
} catch (error) {
  console.error('Error refreshing token:', error);
  // Optionally handle token refresh failure, e.g., redirect to login
  return null;
 }
}
;

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const newToken = await authToken();
        if (!newToken) {
          // Redirect to login or handle failed token refresh
          return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `${newToken}`;
        return apiClient(originalRequest);
      }

      return Promise.reject(error);
    }
);

export default apiClient;