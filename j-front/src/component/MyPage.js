import React, { useState, useEffect } from 'react';
import './MyPage.css';
import { Modal, Button } from 'react-bootstrap';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import apiClient from "../helpers/apiClient";

function MyPage() {
    const [showModal, setShowModal] = useState(false);
    const [userId, setUserId] = useState(null);
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [plans, setPlans] = useState([]);
    const [posts, setPosts] = useState([]);
    const [isAddingPlan, setIsAddingPlan] = useState(false);
    const [newPlanTitle, setNewPlanTitle] = useState('');

    // Fetch user profile data
    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.get(`/users/${userId}/myPage`, {
                headers: {
                    Authorization: `${localStorage.getItem('authToken')}`
                }
            });
            const { data } = response.data;
            setUserId(data.id);
            setNickname(data.nickname);
            setBio(data.bio);
            setProfileImage(data.profileImage);
            setProfileImagePreview(data.profileImage ? `http://localhost:8080/images/${data.profileImage}` : null);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    // Fetch user plans
    const fetchUserPlans = async () => {
        try {
            const response = await apiClient.get('/plans/myPlans', {
                headers: {
                    Authorization: `${localStorage.getItem('authToken')}`
                }
            });
            const { data } = response.data;
            setPlans(data);
        } catch (error) {
            console.error('Error fetching user plans:', error);
        }
    };

    // Fetch user posts
    const fetchUserPosts = async () => {
        try {
            const response = await apiClient.get(`/users/myPosts`, {
                headers: {
                    Authorization: `${localStorage.getItem('authToken')}`
                }
            });
            const { data } = response.data;
            setPosts(data.contentList);
        } catch (error) {
            console.error('Error fetching user posts:', error);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchUserPlans();
        fetchUserPosts();
    }, []);

    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (file && userId) {
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file));

            try {
                const formData = new FormData();
                formData.append('multipartFile', file);  // Updated to match backend parameter

                const response = await apiClient.post(`/users/${userId}/profile-image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `${localStorage.getItem('authToken')}`
                    },
                });

                const { profileImage } = response.data.data;
                setProfileImage(profileImage);
                setProfileImagePreview(`http://localhost:8080/images/${profileImage}`);
            } catch (error) {
                console.error('Error uploading profile image:', error);
            }
        }
    };

    const handleSaveChanges = () => {
        // Add save logic here
        setShowModal(false);
    };

    const handleDeleteAccount = async () => {
        const password = window.prompt('정말 탈퇴하시겠어요?\n탈퇴하려면 비밀번호를 입력하세요.');

        if (password) {
            try {
                const response = await apiClient.delete('/users', {
                    headers: {
                        Authorization: `${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    },
                    data: { password }
                });

                localStorage.removeItem('authToken');
                window.alert('계정이 성공적으로 탈퇴되었습니다.');
                window.location.href = '/home';

            } catch (error) {
                console.error('Error deleting account:', error);
                window.alert('계정 탈퇴에 실패했습니다. 비밀번호를 다시 확인하세요.');
            }
        } else {
            console.log('회원 탈퇴가 취소되었습니다.');
        }
    };

    const handleAddPlan = () => {
        setIsAddingPlan(true);
    };

    const handleSaveNewPlan = () => {
        if (newPlanTitle.trim() !== '') {
            setPlans([...plans, { id: plans.length + 1, title: newPlanTitle }]);
            setNewPlanTitle('');
            setIsAddingPlan(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSaveNewPlan();
        }
    };

    return (
        <div className="my-page-container">
            <div className="profile-section">
                <div className="profile-image">
                    {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile" />
                    ) : (
                        <div>{'{path}'}</div>
                    )}
                </div>
                <div className="profile-info">
                    <h2 className="nickname">{nickname}</h2>
                    <p className="bio">{bio}</p>
                    <div className="profile-actions">
                        <button className="btn" onClick={() => setShowModal(true)}>프로필 수정</button>
                        <button className="btn" onClick={handleDeleteAccount}>회원 탈퇴</button>
                    </div>
                </div>
            </div>
            <div className="plans-section">
                <h3>나의 플랜</h3>
                {plans.map((plan) => (
                    <div key={plan.id} className="plan-item">
                        {plan.title}
                    </div>
                ))}
                {isAddingPlan && (
                    <div className="plan-item">
                        <input
                            type="text"
                            placeholder="플랜 타이틀"
                            value={newPlanTitle}
                            onChange={(e) => setNewPlanTitle(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoFocus
                        />
                    </div>
                )}
                {!isAddingPlan && (
                    <div className="add-button" onClick={handleAddPlan}>+</div>
                )}
            </div>
            <div className="posts-section">
                <h3>내가 작성한 추천 글</h3>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.id} className="post-item">
                            {post.title}
                        </div>
                    ))
                ) : (
                    <p>게시물이 없습니다.</p>
                )}
                <div className="add-button">+</div>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>프로필 수정 모달창</Modal.Title>
                    <Button variant="light" onClick={() => setShowModal(false)}>
                        <FaTimes />
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    <div className="modal-profile-section">
                        <div className="modal-profile-image">
                            {profileImagePreview ? (
                                <img src={profileImagePreview} alt="Profile" />
                            ) : (
                                <div>{'{path}'}</div>
                            )}
                            <label className="upload-button">
                                <FaPlus />
                                <input type="file" accept="image/*" onChange={handleProfileImageChange} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <div className="modal-profile-info">
                            <input
                                type="text"
                                placeholder="닉네임"
                                value={nickname || ''}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="한줄소개"
                                value={bio || ''}
                                onChange={(e) => setBio(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="현재 비밀번호"
                                value={currentPassword || ''}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="새로운 비밀번호"
                                value={newPassword || ''}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="새로운 비밀번호 재입력"
                                value={confirmPassword || ''}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSaveChanges}>
                        <FaCheck/>
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default MyPage;
