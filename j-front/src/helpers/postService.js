
import apiClient from "./apiClient";


export const fetchPosts = async (page,region, theme) => {
  try {
    const response = await apiClient.get(`/posts/place-name`, {
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