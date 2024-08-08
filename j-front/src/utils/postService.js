import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const fetchPosts = async (page,region, theme) => {
  try {
    const response = await axios.get(`${API_URL}/v1/posts/place-name`, {
      params: {
        region: region || '',
        theme: theme || '',
        page : page || 1,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch posts', error);
    throw error;
  }
};