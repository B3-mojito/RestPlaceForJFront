import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PostView = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace with your API endpoint
    fetch(`https://localhost:8080/v1/posts/${postId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => setPost(data))
    .catch((error) => setError(error));
  }, [postId]);

  if (error) return <p>Error loading post: {error.message}</p>;
  if (!post) return <p>Loading...</p>;

  return (
      <div className="post-view">
        <h1>{post.title}</h1>
      </div>
  );
};

export default PostView;