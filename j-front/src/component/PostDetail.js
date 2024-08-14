import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import apiClient from '../helpers/apiClient';

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [postImage, setPostImage] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for modal
  const [isMapActive, setIsMapActive] = useState(true);

  // 추가된 상태들
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [memo, setMemo] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchLoggedInUser();
    fetchPost();
    fetchPostImage();
    fetchPlans();
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [postId, currentPage]);

  const fetchLoggedInUser = async () => {
    try {
      const response = await apiClient.get('/users/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      setLoggedInUserId(response.data.data.userId);
    } catch (error) {
      console.error('Error fetching logged-in user details:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await apiClient.get(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      setPost(response.data.data);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const fetchPostImage = async () => {
    try {
      const response = await apiClient.get(`/images/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      setPostImage(response.data.data.path);
    } catch (error) {
      console.error('Error fetching post image:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await apiClient.get('/plans/myPlans', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      setPlans(response.data.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchCards = async (planId) => {
    try {
      const response = await apiClient.get(`/plans/${planId}/cards`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      setCards(response.data.data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`/posts/${postId}/comments?page=${currentPage}&size=5`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      const { contentList, totalPages } = response.data.data;
      setComments(contentList);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handlePlanChange = (e) => {
    const selectedPlan = e.target.value;
    setSelectedPlanId(selectedPlan);
    fetchCards(selectedPlan); // 선택된 플랜에 맞는 카드들을 가져옵니다.
  };

  const handleCardChange = (e) => {
    setSelectedCardId(e.target.value);
  };

  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await apiClient.post(`/posts/${postId}/comments`, { content: newComment }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        setNewComment('');
        fetchComments();  // Refresh comments after successful submission
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
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

  const handleEditPost = () => {
    navigate(`/posts/${postId}/edit`);
  };

  const handleDeletePost = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      try {
        await apiClient.delete(`/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });
        navigate('/'); // Redirect to the homepage after deletion
      } catch (error) {
        console.error('Error deleting the post:', error);
      }
    }
  };

  const handlePostLike = async () => {
    try {
      const response = await apiClient.post(`/posts/${postId}/likes`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        fetchPost();
      }
    } catch (error) {
      console.error('Error liking the post:', error);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const response = await apiClient.post(`/comments/${commentId}/likes`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error liking the comment:', error);
    }
  };

  const handleAddCardToPlan = async (e) => {
    e.preventDefault();

    const addCardRequestDto = {
      planId: selectedPlanId,
      address: post.address,
      placeName: post.placeName,
      themeEnum: post.themeEnum,
      startedAt: startedAt,
      endedAt: endedAt,
      memo: memo,
    };

    if (selectedCardId) {
      // 선택된 카드가 있는 경우
      try {
        const response = await apiClient.patch(`columns/${postId}/cards/${selectedCardId}`, {
          title: post.title,
          address: post.address,
          placeName: post.placeName,
          startedAt: startedAt,
          endedAt: endedAt,
          memo: memo,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data) {
          closeModal(); // 성공적으로 등록 후 모달 닫기
        }
      } catch (error) {
        console.error('Error updating card:', error);
      }
    } else {
      // 선택된 카드가 없는 경우
      try {
        const response = await apiClient.post(`/posts/${postId}`, addCardRequestDto, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data) {
          closeModal(); // 성공적으로 등록 후 모달 닫기
        }
      } catch (error) {
        console.error('Error adding card to plan:', error);
      }
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
    setIsMapActive(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setIsMapActive(true);
  };

  useEffect(() => {
    if (isMapActive && post) {
      loadKakaoMapsScript().then(() => {
        initKakaoMap(post.address);
      }).catch(err => {
        console.error("Failed to load Kakao Maps API", err);
      });
    }
  }, [isMapActive, post]);

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

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, function (result, status) {
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
          {post.profileImage && (
              <img src={post.profileImage} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }} />
          )}
          <span>{post.nickName}</span> &middot;
          <span>{post.viewsCount} views</span> &middot;
          <span>{post.likesCount} likes</span>
          <button onClick={handlePostLike} style={{ marginLeft: '10px' }}>Like</button>
          &middot;
          <span>{post.address}</span> &middot;
          <span>{post.themeEnum}</span> &middot;
          <span>{post.placeName}</span> {/* Display the placeName */}
        </div>

        {/* Conditionally render Edit and Delete buttons if the post was created by the logged-in user */}
        {loggedInUserId === post.userId && (
            <div style={{ marginTop: '10px' }}>
              <button onClick={handleEditPost} style={{ marginRight: '10px' }}>Edit</button>
              <button onClick={handleDeletePost} style={{ color: 'red', marginRight: '10px' }}>Delete</button>
              <button onClick={openModal}>계획에 추가</button> {/* Button to open modal */}
            </div>
        )}

        <div id="kakaoMap" style={{ width: '100%', height: '400px', marginTop: '20px', zIndex: 1, opacity: isMapActive ? 1 : 0, pointerEvents: isMapActive ? 'auto' : 'none' }}></div>

        {postImage && (
            <div style={{ marginTop: '20px' }}>
              <img src={postImage} alt={"Post Image"} style={{ width: '100%', height: 'auto', marginBottom: '10px' }} />
            </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <p>{post.content}</p>
        </div>
        <div style={{ marginTop: '40px' }}>
          <h4>Comments</h4>
          {comments.length > 0 ? (
              comments.map((comment, index) => (
                  <div key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    {comment.profileImage && (
                        <img src={comment.profileImage} alt="Profile" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} />
                    )}
                    <div>
                      <strong>{comment.nickName}</strong>: {comment.content} &middot;
                      <span style={{ marginLeft: '5px' }}>{comment.likesCount} likes</span>
                      <button onClick={() => handleCommentLike(comment.id)} style={{ marginLeft: '10px' }}>Like</button>
                    </div>
                  </div>
              ))
          ) : (
              <p>No comments yet.</p>
          )}

          <div style={{ marginTop: '20px' }}>
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>Previous</button>
            <span style={{ margin: '0 10px' }}>Page {currentPage + 1} of {totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>Next</button>
          </div>

          <textarea
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={handleNewCommentChange}
              style={{ width: '100%', height: '100px', marginTop: '20px' }}
          ></textarea>
          <button onClick={handleCommentSubmit} style={{ marginTop: '10px', padding: '10px 20px' }}>댓글 등록</button>
        </div>

        {/* Modal Implementation */}
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="추가 계획 모달"
            ariaHideApp={false}
            style={{ content: { zIndex: 1000 } }}
        >
          <h2>카드로 추가 모달창</h2>
          <form onSubmit={handleAddCardToPlan}>
            <label htmlFor="plan">추가할 플랜을 선택하세요</label>
            <select id="plan" value={selectedPlanId} onChange={handlePlanChange} required>
              <option value="">플랜을 선택하세요</option>
              {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.title}</option>
              ))}
            </select>

            {cards.length > 0 && (
                <>
                  <label htmlFor="card">추가할 카드를 선택하세요</label>
                  <select id="card" value={selectedCardId} onChange={handleCardChange}>
                    <option value="">카드를 선택하세요</option>
                    {cards.map(card => (
                        <option key={card.id} value={card.id}>{card.title}</option>
                    ))}
                  </select>
                </>
            )}

            <label htmlFor="startTime">시작시간</label>
            <input type="time" id="startTime" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} required/>

            <label htmlFor="endTime">종료시간</label>
            <input type="time" id="endTime" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} required/>

            <label htmlFor="memo">메모를 입력하세요</label>
            <textarea id="memo" value={memo} onChange={(e) => setMemo(e.target.value)}></textarea>

            <button type="submit">확인</button>
            <button type="button" onClick={closeModal}>취소</button>
          </form>
        </Modal>
      </div>
  );
};

export default PostDetail;
