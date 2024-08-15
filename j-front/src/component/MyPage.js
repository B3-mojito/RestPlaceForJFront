import React, { useState, useEffect } from 'react';
import './MyPage.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import apiClient from "../helpers/apiClient";
import { useNavigate } from 'react-router-dom';

function MyPage() {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
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
    const [newPlanTitle, setNewPlanTitle] = useState('');
    const [isImageChanged, setIsImageChanged] = useState(false); // Track if the image has been changed
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans/myPlans', {
                    headers: {
                        Authorization: localStorage.getItem('authToken')
                    }
                });
                setPlans(response.data.data);
            } catch (error) {
                console.error('Failed to fetch plans:', error);
            }
        };

        fetchPlans();
    }, []);

    const handleCreatePlan = async () => {
        try {
            const response = await apiClient.post('/plans',
                {
                    title: newPlanTitle
                },
                {
                    headers: {
                        Authorization: localStorage.getItem('authToken')
                    }
                });

            setPlans([...plans, response.data.data]);
            setShowPlanModal(false);
            setNewPlanTitle('');
        } catch (error) {
            console.error('Failed to create plan:', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.get(`/users/myPage`, {
                headers: {
                    Authorization: `${localStorage.getItem('authToken')}`
                }
            });
            const { data } = response.data;
            setUserId(data.userId);
            setNickname(data.nickname);
            setBio(data.bio);
            setProfileImage(data.profileImage);
            setProfileImagePreview(data.profileImage ? `${data.profileImage}` : null);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

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

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file)); // Instant preview
            setIsImageChanged(true); // Mark image as changed
        }
    };

    const handleSaveChanges = async () => {
        try {
            // 먼저 프로필 정보를 업데이트
            const payload = {
                nickname: nickname,
                bio: bio,
                currentPassword: currentPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword,
            };

            const profileResponse = await apiClient.patch(`/users/${userId}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${localStorage.getItem('authToken')}`,
                },
            });

            const { data } = profileResponse.data;
            setNickname(data.nickname);
            setBio(data.bio);

            // 만약 프로필 이미지가 선택된 경우에만 업로드 처리
            if (isImageChanged) {
                const formData = new FormData();
                formData.append('images', profileImage); // Match with backend @RequestPart("images")

                const imageResponse = await apiClient.post(`/users/myPage/profile-image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `${localStorage.getItem('authToken')}`
                    },
                });

                const { profileImage: newProfileImage } = imageResponse.data.data;
                setProfileImage(newProfileImage);
                setProfileImagePreview(`http://localhost:8080/images/${newProfileImage}`);
            }

            setShowProfileModal(false);
            window.alert('프로필이 성공적으로 업데이트되었습니다.');
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response && error.response.data && error.response.data.message) {
                window.alert(`프로필 업데이트에 실패했습니다: ${error.response.data.message}`);
            } else {
                window.alert('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
            }
        }
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

                if (response.status === 200) {
                    localStorage.removeItem('authToken');
                    window.alert('계정이 성공적으로 탈퇴되었습니다.');
                } else {
                    console.error('Unexpected response status:', response.status);
                    window.alert('계정 탈퇴에 실패했습니다. 다시 시도해주세요.');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                if (error.response && error.response.status === 401) {
                    window.alert('비밀번호가 올바르지 않습니다.');
                } else {
                    window.alert('계정 탈퇴에 실패했습니다. 다시 시도해주세요.');
                }
            }
        } else {
            console.log('회원 탈퇴가 취소되었습니다.');
        }
    };

    const handleAddPost = () => {
        navigate('/posting');  // 사용자를 /posting 경로로 이동시킵니다.
    };

    const handlePostClick = (post) => {
        navigate(`/posts/${post.id}`);
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
                        <button className="btn" onClick={() => setShowProfileModal(true)}>프로필 수정</button>
                        <button className="btn" onClick={handleDeleteAccount}>회원 탈퇴</button>
                    </div>
                </div>
            </div>

            <div className="plans-section">
                <h3>나의 플랜</h3>
                <div className="plans-list">
                    {plans.length > 0 ? (
                        plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="plan-item"
                                onClick={() => navigate(`/plan/${plan.id}`, { state: { plan } })}
                            >
                                {plan.title}
                            </div>
                        ))
                    ) : (
                        <p className="no-plans">아직 계획이 없습니다.</p>
                    )}
                    <div className="add-button" onClick={() => setShowPlanModal(true)}>+</div>
                </div>

                <Modal show={showPlanModal} onHide={() => setShowPlanModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>새 플랜 추가</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>플랜 제목</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newPlanTitle}
                                    onChange={(e) => setNewPlanTitle(e.target.value)}
                                    placeholder="플랜 제목을 입력하세요"
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPlanModal(false)}>취소</Button>
                        <Button variant="primary" onClick={handleCreatePlan}>저장</Button>
                    </Modal.Footer>
                </Modal>
            </div>

            <div className="posts-section">
                <h3>내가 작성한 추천 글</h3>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="post-item"
                            onClick={() => handlePostClick(post)}
                        >
                            {post.title}
                        </div>
                    ))
                ) : (
                    <p>게시물이 없습니다.</p>
                )}
                <div className="add-button" onClick={handleAddPost}>+</div>
            </div>

            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
                <Modal.Header>
                    <Modal.Title>프로필 수정</Modal.Title>
                    <Button variant="light" onClick={() => setShowProfileModal(false)}>
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
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                    style={{ display: 'none' }}
                                />
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
                        <FaCheck />
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default MyPage;
