import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../helpers/apiClient';

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = React.useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await apiClient.get(`/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        setPost(response.data.data);
      } catch (error) {
        console.error('Error fetching post details:', error);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (post) {
      loadKakaoMapsScript().then(() => {
        initKakaoMap(post.address);
      }).catch(err => {
        console.error("Failed to load Kakao Maps API", err);
      });
    }
  }, [post]);

  const loadKakaoMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=f90abf763c49b09ee81cd9b1f5f0b3ef&libraries=services,clusterer,drawing&autoload=false";
        script.onload = () => {
          window.kakao.maps.load(() => {
            resolve();
          });
        };
        script.onerror = () => {
          reject(new Error('Failed to load Kakao Maps script.'));
        };
        document.head.appendChild(script);
      }
    });
  };

  const initKakaoMap = (address) => {
    if (window.kakao && window.kakao.maps && address) {
      const container = document.getElementById('kakaoMap');
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Default center if geocoding fails (Seoul)
        level: 3
      };
      const map = new window.kakao.maps.Map(container, options);

      // Use Geocoder to convert address to coordinates
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, function(result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          map.setCenter(coords);

          const marker = new window.kakao.maps.Marker({
            map: map,
            position: coords
          });
        } else {
          console.error('Failed to convert address to coordinates:', status);
        }
      });
    }
  };

  if (!post) {
    return <p>Loading...</p>;
  }

  return (
      <div style={{ padding: '20px' }}>
        <h1>{post.title}</h1>
        <div>
          <span>{post.nickName}</span> &middot; <span>{post.viewsCount} views</span> &middot; <span>{post.address}</span>
        </div>
        <div id="kakaoMap" style={{ width: '100%', height: '400px', marginTop: '20px' }}></div>
        <div style={{ marginTop: '20px' }}>
          <p>{post.content}</p>
        </div>
        <div style={{ marginTop: '40px' }}>
          <h4>Comments</h4>
          {post.comments && post.comments.map((comment, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <strong>{comment.nickName}</strong>: {comment.content}
              </div>
          ))}
          <textarea placeholder="댓글을 입력하세요" style={{ width: '100%', height: '100px', marginTop: '20px' }}></textarea>
          <button style={{ marginTop: '10px', padding: '10px 20px' }}>댓글 등록</button>
        </div>
      </div>
  );
};

export default PostDetail;
