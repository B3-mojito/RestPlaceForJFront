import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import './MyPage.css';
import apiClient from "../helpers/apiClient";

function About() {
  const {userId} = useParams(); // Use useParams to dynamically get userId from URL
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [plans, setPlans] = useState([]);  // Initialize as empty array
  const [posts, setPosts] = useState([]);  // Initialize as empty array
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get(`/users/${userId}`, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });
      const {data} = response.data;
      setNickname(data.nickname);
      setBio(data.bio);
      setProfileImage(data.profileImage);
      setProfileImagePreview(data.profileImage ? `${data.profileImage}` : null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch user plans
  const fetchUserPlans = async () => {
    try {
      const response = await apiClient.get(`/plans?userId=${userId}`, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });
      const {data} = response.data;
      setPlans(data);
    } catch (error) {
      console.error('Error fetching user plans:', error);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      const response = await apiClient.get(`/users/${userId}/posts`, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });
      const {data} = response.data;
      setPosts(data.contentList);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handlePostClick = (post) => {
    navigate(`/posts/${post.id}`);
  };

  // Fetch data when userId is available
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPlans();
      fetchUserPosts();
    }
  }, [userId]); // Depend on userId, so it runs when userId changes

  return (
      <div className="my-page-container">
        <div className="profile-section">
          <div className="profile-image">
            {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile"/>
            ) : (
                <div>{'{path}'}</div>
            )}
          </div>
          <div className="profile-info">
            <h2 className="nickname">{nickname}</h2>
            <p className="bio">{bio}</p>
          </div>
        </div>
        <div className="plans-section">
          <h3>{nickname}님의 플랜</h3>
          {plans.length > 0 ? (
              plans.map((plan) => (
                  <div key={plan.id} className="plan-item">
                    {plan.title}
                  </div>
              ))
          ) : (
              <p>게시물이 없습니다.</p>
          )}
        </div>
        <div className="posts-section">
          <h3>{nickname}님이 작성한 추천 글</h3>
          {posts.length > 0 ? (
              posts.map((post) => (
                  <div
                      key={post.id}
                      className="post-item"
                      onClick={() => handlePostClick(
                          post)}
                  >
                    {post.title}
                  </div>
              ))
          ) : (
              <p>게시물이 없습니다.</p>
          )}
        </div>
      </div>
  );
}

export default About;
