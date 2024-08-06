import React, { useState } from 'react';
import './MyPage.css';
import { Modal, Button } from 'react-bootstrap';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';

function MyPage() {
    const [showModal, setShowModal] = useState(false);
    const [nickname, setNickname] = useState('');
    const [bio, setBio] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        setProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
    };

    const handleSaveChanges = () => {
        // 여기에 저장 로직을 추가합니다.
        setShowModal(false);
    };

    const handleDeleteAccount = () => {
        const password = window.prompt('정말 탈퇴하시겠어요?\n탈퇴하려면 비밀번호를 입력하세요.');
        if (password) {
            console.log('입력된 비밀번호:', password);
            // 여기에서 비밀번호를 확인하고 회원 탈퇴 처리 로직을 추가합니다.
        } else {
            console.log('회원 탈퇴가 취소되었습니다.');
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
                    <h2 className="nickname">{'{nickname}'}</h2>
                    <p className="bio">{'{bio}'}</p>
                    <div className="profile-actions">
                        <button className="btn" onClick={() => setShowModal(true)}>프로필 수정</button>
                        <button className="btn" onClick={handleDeleteAccount}>회원 탈퇴</button>
                    </div>
                </div>
            </div>
            <div className="plans-section">
                <h3>나의 플랜</h3>
                <div className="plan-item">{'{title}'}</div>
                <div className="plan-item">{'{title}'}</div>
                <div className="add-button">+</div>
            </div>
            <div className="posts-section">
                <h3>내가 작성한 추천 글</h3>
                <div className="post-item">{'{title}'}</div>
                <div className="post-item">{'{title}'}</div>
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
                            <input type="text" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                            <input type="text" placeholder="한줄소개" value={bio} onChange={(e) => setBio(e.target.value)} />
                            <input type="password" placeholder="현재 비밀번호" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            <input type="password" placeholder="새로운 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            <input type="password" placeholder="새로운 비밀번호 재입력" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
