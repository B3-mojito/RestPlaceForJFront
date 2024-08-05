// MyPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FloatingLabel, Form, Button, ListGroup } from 'react-bootstrap';
import './MyPage.css';

function MyPage() {
    const { userId } = useParams(); // useParams 훅을 사용하여 URL 파라미터에서 userId 가져오기
    const [user, setUser] = useState(null);
    const [plans, setPlans] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await axios.get(`/v1/users/${userId}`);
                setUser(userResponse.data.data);

                const plansResponse = await axios.get(`/v1/plans?userId=${userId}`);
                setPlans(plansResponse.data.data);

                const postsResponse = await axios.get(`http://localhost:8080/v1/users/${userId}/posts`);
                setRecommendations(postsResponse.data.data.contentList);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, [userId]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="myPage">
            <div className="profile-section">
                <img src={user.profileImage} alt="Profile" className="profile-image" />
                <div className="profile-info">
                    <h2>{user.nickname}</h2>
                    <p>{user.bio}</p>
                    <Button variant="primary">프로필 수정</Button>
                    <Button variant="danger">회원 탈퇴</Button>
                </div>
            </div>
            <div className="plans-section">
                <h3>나의 플랜</h3>
                <ListGroup as="ul" numbered>
                    {plans.map((plan, index) => (
                        <ListGroup.Item as="li" key={index} className="plan-title">{plan.title}</ListGroup.Item>
                    ))}
                </ListGroup>
                <Button className="add-btn">+</Button>
            </div>
            <div className="recommendations-section">
                <h3>내가 작성한 추천 글</h3>
                <ListGroup as="ul" numbered>
                    {recommendations.map((rec, index) => (
                        <ListGroup.Item as="li" key={index}>
                            <h4>{rec.title}</h4>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                <Button className="add-btn">+</Button>
            </div>
        </div>
    );
}

export default MyPage;
