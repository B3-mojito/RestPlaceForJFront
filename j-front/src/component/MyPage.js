import React, {useEffect, useState} from 'react';
import './MyPage.css';
import {Button, Form, Modal} from 'react-bootstrap';
import {FaCheck, FaTimes} from 'react-icons/fa';
import apiClient from "../helpers/apiClient";
import {useNavigate} from 'react-router-dom';

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [isImageChanged, setIsImageChanged] = useState(false); // Track if the image has been changed
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
        console.error('유저를 찾을수 없거나', error.response.data.message);
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
      window.location.reload();
    } catch (error) {
      console.error(error.response.data.message);
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
      console.error(error.response.data.message);
    }
  };
  const handleSavePasswordChanges = async () => {
    try {
      const payload = {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      };

      const response = await apiClient.patch(`/users/${userId}/password`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${localStorage.getItem('authToken')}`,
        },
      });

      window.alert(response.data.message);
      setShowPasswordModal(false);
    } catch (error) {
      console.error('비밀번호 변경에 실패했습니다:', error.response.data.message);
      if (error.response && error.response.data && error.response.data.message) {
        window.alert(`비밀번호 변경에 실패했습니다: ${error.response.data.message}`);
      } else {
        window.alert('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
      }
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
      console.error( "플랜이 존재하지 않거나 " + error.response.data.message);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await apiClient.get(`/users/myPosts?page=${currentPage}&size=5`, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });
      const { contentList, totalPages } = response.data.data;
      setPosts(contentList);
      setTotalPages(totalPages);
    } catch (error) {
      console.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserPlans();
    fetchUserPosts();
  }, [currentPage]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file)); // Instant preview
      setIsImageChanged(true); // Mark image as changed
    }
  };

  const handleSaveImage = async () => {
    if (isImageChanged && profileImage) {
      try {
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
        setProfileImagePreview(`https://api.restplaceforj.com/images/${newProfileImage}`);
        window.alert('프로필 이미지가 성공적으로 업데이트되었습니다.');
        setIsImageChanged(false);
        window.location.reload();
      } catch (error) {
        console.error('이미지 업데이트 실패:', error.response.data.message);
        window.alert('프로필 이미지 업데이트에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
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

      setShowProfileModal(false);
      console.log(profileResponse.data.message);
      window.alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error.response.data.message);
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
          localStorage.removeItem('RefreshToken');
          window.alert('계정이 성공적으로 탈퇴되었습니다.');
          navigate('/');
        } else {
          console.error('탈퇴 실패:', response.data.message);
          window.alert('계정 탈퇴에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error('탈퇴 실패:', error.response.data.message);
        if (error.response && error.response.status === 401) {
          window.alert(error.response.data.message);
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

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
      <div className="my-page-container">
        <div className="profile-section">
          <div className="profile-image" onClick={() => document.getElementById('profileImageInput').click()}>
            {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" />
            ) : (
                <></>
            )}
            <input
                type="file"
                id="profileImageInput"
                accept="image/*"
                onChange={handleProfileImageChange}
                style={{ display: 'none' }}
            />
          </div>
          {isImageChanged && (
              <Button variant="primary" onClick={handleSaveImage}>
                저장
              </Button>
          )}
          <div className="profile-info">
            <h2 className="nickname">{nickname}</h2>
            <p className="bio">{bio}</p>
            <div className="profile-actions">
              <button className="btn"
                      onClick={() => setShowProfileModal(true)}>프로필 수정
              </button>
              <button className="btn"
                      onClick={() => setShowPasswordModal(true)}>비밀번호
                변경
              </button>
              <button className="btn" onClick={handleDeleteAccount}>회원
                탈퇴
              </button>
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
          <div style={{marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'}}>
            <button onClick={handlePreviousPage}
                    disabled={currentPage === 0}>
              이전
            </button>
            <span style={{margin: '0 10px'}}>
              {currentPage + 1} ... {totalPages}
            </span>
            <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
            >
              다음
            </button>
          </div>
        </div>

        <Modal show={showProfileModal}
               onHide={() => setShowProfileModal(false)}>
          <Modal.Header>
            <Modal.Title>프로필 수정</Modal.Title>
            <Button variant="light"
                    onClick={() => setShowProfileModal(false)}>
              <FaTimes/>
            </Button>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-profile-section">
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
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleSaveChanges}>
              <FaCheck/>
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
          <Modal.Header>
            <Modal.Title>비밀번호 변경</Modal.Title>
            <Button variant="light" onClick={() => setShowPasswordModal(false)}>
              <FaTimes />
            </Button>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-profile-section">
              <div className="modal-profile-info">
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
            <Button variant="primary" onClick={handleSavePasswordChanges}>
              <FaCheck />
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
  );
}

export default MyPage;
