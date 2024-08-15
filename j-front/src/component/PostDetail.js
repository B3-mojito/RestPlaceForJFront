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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isMapActive, setIsMapActive] = useState(true);

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [memo, setMemo] = useState('');

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchLoggedInUser();
    fetchPost();
    fetchPostImage();
    fetchPlans();
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
        },withCredentials : true,
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
      const response = await apiClient.get(
          `/posts/${postId}/comments?page=${currentPage}&size=5`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          }
      );

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
    fetchCards(selectedPlan);
  };

  const handleCardChange = (e) => {
    setSelectedCardId(e.target.value);
  };

  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await apiClient.post(
          `/posts/${postId}/comments`,
          { content: newComment },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          }
      );

      if (response.data) {
        setNewComment('');
        fetchComments();
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
    const confirmDelete = window.confirm(
        'Are you sure you want to delete this post?'
    );
    if (confirmDelete) {
      try {
        await apiClient.delete(`/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });
        navigate('/');
      } catch (error) {
        console.error('Error deleting the post:', error);
      }
    }
  };

  const handlePostLike = async () => {
    try {
      const response = await apiClient.post(
          `/posts/${postId}/likes`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          }
      );

      if (response.data) {
        fetchPost();
      }
    } catch (error) {
      console.error('Error liking the post:', error);
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const response = await apiClient.post(
          `/comments/${commentId}/likes`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          }
      );

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
      try {
        const response = await apiClient.patch(
            `columns/${postId}/cards/${selectedCardId}`,
            {
              title: post.title,
              address: post.address,
              placeName: post.placeName,
              startedAt: startedAt,
              endedAt: endedAt,
              memo: memo,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
              },
            }
        );

        if (response.data) {
          closeModal();
        }
      } catch (error) {
        console.error('Error updating card:', error);
      }
    } else {
      try {
        const response = await apiClient.post(
            `/posts/${postId}`,
            addCardRequestDto,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
              },
            }
        );

        if (response.data) {
          closeModal();
        }
      } catch (error) {
        console.error('Error adding card to plan:', error);
      }
    }
  };

  const handleEditComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const response = await apiClient.patch(
          `/posts/${postId}/comments/${commentId}`,
          { content: editCommentContent },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
          }
      );

      if (response.data) {
        setEditingCommentId(null);
        setEditCommentContent('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmDelete = window.confirm(
        'Are you sure you want to delete this comment?'
    );
    if (confirmDelete) {
      try {
        await apiClient.delete(`/posts/${postId}/comments/${commentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        fetchComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
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
      loadKakaoMapsScript()
      .then(() => {
        initKakaoMap(post.address);
      })
      .catch((err) => {
        console.error('Failed to load Kakao Maps API', err);
      });
    }
  }, [isMapActive, post]);

  const loadKakaoMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src =
            'https://dapi.kakao.com/v2/maps/sdk.js?appkey=f90abf763c49b09ee81cd9b1f5f0b3ef&libraries=services,clusterer,drawing&autoload=false';
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
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, function (result, status) {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          map.setCenter(coords);

          const marker = new window.kakao.maps.Marker({
            map: map,
            position: coords,
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
        <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {post.profileImage && (
                <img
                    src={post.profileImage}
                    alt="Profile"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      marginRight: '10px',
                    }}
                    onClick={() => navigate(`/about/${post.userId}`)}
                />
            )}
            <span onClick={() => navigate(`/about/${post.userId}`)}>
            {post.nickName}
          </span>
          </div>
          <div>
            {loggedInUserId === post.userId && (
                <div>
                  <button onClick={handleEditPost} style={{ marginRight: '10px' }}>
                    수정
                  </button>
                  <button
                      onClick={handleDeletePost}
                      style={{ color: 'red', marginRight: '10px' }}
                  >
                    삭제
                  </button>
                </div>
            )}
            <button onClick={openModal}>계획에 추가</button>
          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <span style={{ display: 'block' }}>조회수 {post.viewsCount}</span>
          <span style={{ display: 'block' }}>좋아요 {post.likesCount}</span>
          <span style={{ display: 'block' }}>
          📍{post.address} {post.placeName}
        </span>
        </div>

        <div
            id="kakaoMap"
            style={{
              width: '100%',
              height: '400px',
              marginTop: '20px',
              zIndex: 1,
              opacity: isMapActive ? 1 : 0,
              pointerEvents: isMapActive ? 'auto' : 'none',
            }}
        ></div>

        {postImage && (
            <div style={{ marginTop: '20px' }}>
              <img
                  src={postImage}
                  alt="Post Image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    marginBottom: '10px',
                  }}
              />
            </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <p>{post.content}</p>
        </div>

        <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '20px',
              flexDirection: 'column',
            }}
        >
          <button
              onClick={handlePostLike}
              style={{
                border: '2px solid #ccc',
                borderRadius: '15px',
                padding: '10px 20px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
              }}
          >
            ❤️
          </button>
        </div>

        <div style={{ marginTop: '40px' }}>
          <h4>Comments</h4>
          {comments.length > 0 ? (
              comments.map((comment, index) => (
                  <div
                      key={index}
                      style={{
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                  >
                    {comment.profileImage && (
                        <img
                            src={comment.profileImage}
                            alt="Profile"
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              marginRight: '10px',
                            }}
                            onClick={() => navigate(`/about/${comment.userId}`)}
                        />
                    )}
                    <div>
                      <strong
                          onClick={() => navigate(`/about/${comment.userId}`)}
                      >
                        {comment.nickName}
                      </strong>{' '}
                      :{' '}
                      {editingCommentId === comment.id ? (
                          <>
                            <input
                                type="text"
                                value={editCommentContent}
                                onChange={(e) =>
                                    setEditCommentContent(e.target.value)
                                }
                            />
                            <button onClick={() => handleUpdateComment(comment.id)}>
                              저장
                            </button>
                            <button onClick={() => setEditingCommentId(null)}>
                              취소
                            </button>
                          </>
                      ) : (
                          <span>{comment.content}</span>
                      )}
                      <button
                          onClick={() => handleCommentLike(comment.id)}
                          style={{ marginLeft: '10px' }}
                      >
                        ❤️
                      </button>
                      <span style={{ marginLeft: '5px' }}>{comment.likesCount}</span>
                      {loggedInUserId === comment.userId && (
                          <>
                            <button
                                onClick={() =>
                                    handleEditComment(comment.id, comment.content)
                                }
                                style={{ marginLeft: '10px' }}
                            >
                              수정
                            </button>
                            <button
                                onClick={() => handleDeleteComment(comment.id)}
                                style={{ marginLeft: '10px', color: 'red' }}
                            >
                              삭제
                            </button>
                          </>
                      )}
                    </div>
                  </div>
              ))
          ) : (
              <p>No comments yet.</p>
          )}

          <div style={{ marginTop: '20px' }}>
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              Previous
            </button>
            <span style={{ margin: '0 10px' }}>
            Page {currentPage + 1} of {totalPages}
          </span>
            <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
            >
              Next
            </button>
          </div>

          <textarea
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={handleNewCommentChange}
              style={{ width: '100%', height: '100px', marginTop: '20px' }}
          ></textarea>
          <button
              onClick={handleCommentSubmit}
              style={{ marginTop: '10px', padding: '10px 20px' }}
          >
            댓글 등록
          </button>
        </div>

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
            <select
                id="plan"
                value={selectedPlanId}
                onChange={handlePlanChange}
                required
            >
              <option value="">플랜을 선택하세요</option>
              {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title}
                  </option>
              ))}
            </select>

            {cards.length > 0 && (
                <>
                  <label htmlFor="card">추가할 카드를 선택하세요</label>
                  <select
                      id="card"
                      value={selectedCardId}
                      onChange={handleCardChange}
                  >
                    <option value="">카드를 선택하세요</option>
                    {cards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.title}
                        </option>
                    ))}
                  </select>
                </>
            )}

            <label htmlFor="startTime">시작시간</label>
            <input
                type="time"
                id="startTime"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                required
            />

            <label htmlFor="endTime">종료시간</label>
            <input
                type="time"
                id="endTime"
                value={endedAt}
                onChange={(e) => setEndedAt(e.target.value)}
                required
            />

            <label htmlFor="memo">메모를 입력하세요</label>
            <textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
            ></textarea>

            <button type="submit">확인</button>
            <button type="button" onClick={closeModal}>
              취소
            </button>
          </form>
        </Modal>
      </div>
  );
};

export default PostDetail;
