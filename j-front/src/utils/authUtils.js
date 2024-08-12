import {jwtDecode} from 'jwt-decode';

// Check if the token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.exp * 1000 < Date.now();  // Convert expiration time to milliseconds
  } catch (e) {
    console.error('Failed to decode token:', e);
    return true;  // Consider token expired if decoding fails
  }
};