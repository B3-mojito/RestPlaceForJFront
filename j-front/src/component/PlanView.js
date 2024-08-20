import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import apiClient from "../helpers/apiClient";
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';

const styles = {
  container: {
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
    minHeight: '100vh'
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#3b5998',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    marginRight: '10px',
    width: '100%',
    boxSizing: 'border-box'
  },
  mapContainer: {
    width: '100%',
    height: '400px',
    marginBottom: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  columnContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'space-around',
    flexWrap: 'wrap'
  },
  column: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    width: '300px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  cardText: {
    fontSize: '14px',
    color: '#555'
  },
  form: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  formColumn: {
    flex: '1',
    minWidth: '200px',
  },
  formInput: {
    width: '100%',
  },
  formButton: {
    alignSelf: 'flex-start',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    width: '500px',  // 기존 300px에서 500px로 증가
    maxWidth: '90%',  // 화면 크기에 따라 반응형 조정
    height: 'auto',   // 높이를 자동으로 설정 (필요에 따라 조정)
    maxHeight: '90%', // 최대 높이를 화면의 90%로 설정하여 오버플로우 방지
    overflowY: 'auto' // 내용이 많을 경우 스크롤 가능하게 설정
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  modalInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    border: '1px solid #ddd',
  },
  modalButton: {
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px',
  },
  searchResultList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginTop: '10px',
    maxHeight: '200px', // Limit the height of the list for better UI
    overflowY: 'auto', // Add a scroll if there are too many items
  },
  searchResultItem: {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  searchResultItemHover: {
    backgroundColor: '#f0f8ff',
    color: '#007bff',
  },
  // Customize the pointer style
  pointer: {
    cursor: 'pointer',
  }
};

function Plan() {
  const location = useLocation();
  const {plan} = location.state;
  const [planTitle, setPlanTitle] = useState(plan.title);
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [newColumnDate, setNewColumnDate] = useState('');
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    title: '',
    address: '',
    placeName: '',
    startedAt: '',
    endedAt: '',
    memo: ''
  });
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [coworkers, setCoworkers] = useState([]);
  const [inviteModalIsOpen, setInviteModalIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const mapContainerRef = useRef(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editColumnData, setEditColumnData] = useState(
      {id: null, title: '', date: ''});
  const navigate = useNavigate();

  useEffect(() => {
    fetchColumns2();
    fetchCoworkers();
  }, []);

  const fetchColumns2 = async () => {
    try {
      const response = await apiClient.get(`/plans/${plan.id}/columns`, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });
      setColumns(response.data.data);
    } catch (error) {
      console.error('Failed to fetch columns:', error.response.data.message);
    }
  };

  const fetchCoworkers = async () => {
    try {
      const response = await apiClient.get(`/plans/${plan.id}/images`, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });
      setCoworkers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch coworkers:', error.response.data.message);
    }
  };

  const handleEditColumn = (column) => {
    setEditColumnData({id: column.id, title: column.title, date: column.date});
    setEditModalVisible(true);
  };

  const handleSaveColumn = async () => {
    try {
      await apiClient.patch(
          `/plans/${plan.id}/columns/${editColumnData.id}`,
          {title: editColumnData.title, date: editColumnData.date},
          {headers: {Authorization: `${localStorage.getItem('authToken')}`}}
      );
      setEditModalVisible(false);
      fetchColumns2();
    } catch (error) {
      console.error('Failed to update column:', error.response.data.message);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
  };

  useEffect(() => {
    fetchColumns();
    loadKakaoMapsScript();
  }, []);

  useEffect(() => {
    if (mapsLoaded && mapContainerRef.current) {
      initializeMap();
    }
  }, [mapsLoaded]);

  useEffect(() => {
    const searchInputElement = document.getElementById('search-input');
    if (searchInputElement) {
      searchInputElement.addEventListener('input', handleSearch);
    }

    return () => {
      // Cleanup event listener on unmount
      if (searchInputElement) {
        searchInputElement.removeEventListener('input', handleSearch);
      }
    };
  }, [mapsLoaded]);

  const loadKakaoMapsScript = () => {
    const scriptUrl = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=a84090a0ae739cccb8c34d58fca902b1&libraries=services,clusterer,drawing&autoload=false"
    if (window.kakao && window.kakao.maps) {
      setMapsLoaded(true);
      return;
    }

    const existingScript = document.getElementById('kakao-maps-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'kakao-maps-script';
      script.src = scriptUrl;
      script.onload = () => {
        window.kakao.maps.load(() => {
          setMapsLoaded(true);
          console.log('Kakao Maps API loaded');
        });
      };
      script.onerror = () => {
        console.error('Failed to load Kakao Maps API script');
      };
      document.body.appendChild(script);
    } else {
      console.log('Kakao Maps API script already loaded');
    }
  };

  const initializeMap = () => {
    const mapContainer = mapContainerRef.current;
    const southKoreaBounds = new window.kakao.maps.LatLngBounds(
        new window.kakao.maps.LatLng(33.0, 124.0), // Southwest corner (Jeju Island area)
        new window.kakao.maps.LatLng(38.5, 132.0)  // Northeast corner (near Ulleungdo)
    );
    const mapOptions = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // Center the map on Seoul
      level: 3, // Zoom level (adjust as needed)
      maxLevel: 10 // Restrict max zoom out level to avoid seeing North Korea
    };

    const map = new window.kakao.maps.Map(mapContainer, mapOptions);
    const ps = new window.kakao.maps.services.Places();
    const geocoder = new window.kakao.maps.services.Geocoder();

    map.setBounds(southKoreaBounds); // Set the maximum bounds to the defined area
    const searchPlaces = (query) => {
      ps.keywordSearch(query, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(data);
        } else {
          console.error('Search failed:', status);
        }
      });
    };

    const handleSearchInput = (e) => {
      const query = e.target.value;
      if (query.length > 2) {
        searchPlaces(query);
      } else {
        setSearchResults([]);
      }
    };

    const handleMapClick = (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      const lat = latlng.getLat();
      const lng = latlng.getLng();

      geocoder.coord2Address(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const address = result[0].address.address_name;
          alert(`Latitude: ${lat}, Longitude: ${lng}, Address: ${address}`);
        } else {
          alert(`Latitude: ${lat}, Longitude: ${lng}`);
        }
      });
    };

    window.kakao.maps.event.addListener(map, 'click', handleMapClick);
  };

  const fetchPlanData = async () => {
    try {
      const response = await apiClient.get(`/plans/${plan.id}`, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });
      setPlanTitle(response.data.data.title);
    } catch (error) {
      console.error('Failed to fetch plan data:', error.response.data.message);
    }
  };

  const fetchColumns = async () => {
    try {
      const response = await apiClient.get(`/plans/${plan.id}/columns`, {
        headers: {
          Authorization: `${localStorage.getItem('authToken')}`
        }
      });

      setColumns(response.data.data);
      fetchCardsForColumns(response.data.data);
    } catch (error) {
      console.error('Failed to fetch columns:', error.response.data.message);
    }
  };

  const fetchCardsForColumns = async (columns) => {
    const cardsData = {};
    for (const column of columns) {
      try {
        const response = await apiClient.get(`/columns/${column.id}/cards`, {
          headers: {
            Authorization: `${localStorage.getItem('authToken')}`
          }
        });
        cardsData[column.id] = response.data.data;
      } catch (error) {
        console.error(`Failed to fetch cards for column ${column.id}:`, error.response.data.message);
      }
    }
    setCards(cardsData);
  };

  const handleTitleChange = async () => {
    try {
      await apiClient.patch(`/plans/${plan.id}`,
          {title: planTitle},
          {headers: {Authorization: `${localStorage.getItem('authToken')}`}}
      );
      setIsEditing(false);
      await fetchPlanData();
    } catch (error) {
      console.error('Failed to update plan title:', error.response.data.message);
    }
  };

  const handleAddColumn = async () => {
    try {
      const response = await apiClient.post(`/plans/${plan.id}/columns`,
          {title: newColumnTitle, date: newColumnDate},
          {headers: {Authorization: `${localStorage.getItem('authToken')}`}}
      );
      setColumns([...columns, response.data.data]);
      setNewColumnTitle('');
      setNewColumnDate('');
    } catch (error) {
      console.error('Failed to add column:', error.response.data.message);
    }
  };

// 플랜 삭제 함수
  const deletePlan = async () => {
    // 사용자에게 경고창을 띄워 확인 요청
    const confirmed = window.confirm("정말로 이 플랜을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");

    // 사용자가 확인을 누른 경우에만 삭제 작업 진행
    if (confirmed) {
      try {
        await apiClient.delete(`/plans/${plan.id}`);
        console.log("플랜 삭제 완료");
        window.location.href = '/plan'; // 홈 페이지로 리다이렉트
      } catch (error) {
        console.error('Error deleting plan:', error.response.data.message);
      }
    } else {
      console.log("플랜 삭제가 취소되었습니다.");
    }
  };

  const deleteColumn = async (column) => {
    // 사용자에게 경고창을 띄워 확인 요청
    const confirmed = window.confirm("정말로 이 컬럼을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");

    // 사용자가 확인을 누른 경우에만 삭제 작업 진행
    if (confirmed) {
      try {
        await apiClient.delete(`/plans/${plan.id}/columns/${column.id}`);
        console.log("일차 삭제 완료");
        fetchColumns();
      } catch (error) {
        console.error('Error deleting plan:', error.response.data.message);
      }
    } else {
      console.log("일차 삭제가 취소되었습니다.");
    }
  };

  // 카드 삭제 함수
  const deleteCard = async (column, card) => {
    // 사용자에게 경고창을 띄워 확인 요청
    const confirmed = window.confirm("정말로 이 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");

    // 사용자가 확인을 누른 경우에만 삭제 작업 진행
    if (confirmed) {
      try {
        await apiClient.delete(`/columns/${column.id}/cards/${card.id}`);

        console.log("일정 삭제 완료");
        fetchColumns();
      } catch (error) {
        console.error('Error deleting plan:', error.response.data.message);
      }
    } else {
      console.log("일정 삭제가 취소되었습니다.");
    }
  };

  const handleAddCard = async () => {
    if (!selectedColumnId) {
      console.error('No column selected');
      return;
    }
    try {
      const response = await apiClient.post(
          `/columns/${selectedColumnId}/cards`,
          {title: newCardTitle, description: newCardDescription},
          {headers: {Authorization: `${localStorage.getItem('authToken')}`}}
      );
      setCards({
        ...cards,
        [selectedColumnId]: [...(cards[selectedColumnId] || []),
          response.data.data]
      });
      setNewCardTitle('');
      setNewCardDescription('');

      // 일정 추가 후 모달 닫기
      closeAddCardModal();
    } catch (error) {
      console.error('Failed to add card:', error.response.data.message);
    }
  };

  const handleOnDragEnd = async (result) => {
    const {destination, source, draggableId} = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index
        === source.index) {
      return;
    }

    const sourceColumnId = parseInt(source.droppableId);
    const destinationColumnId = parseInt(destination.droppableId);
    const cardId = parseInt(draggableId);

    if (sourceColumnId !== destinationColumnId) {
      try {
        await apiClient.patch(
            `/columns/${destinationColumnId}/cards/${cardId}/moveColumn`, {}, {
              headers: {
                Authorization: `${localStorage.getItem('authToken')}`
              }
            });

        setCards(prevCards => {
          const sourceCards = prevCards[sourceColumnId].filter(
              card => card.id !== cardId);
          const card = prevCards[sourceColumnId].find(
              card => card.id === cardId);
          const destinationCards = [...(prevCards[destinationColumnId] || []),
            card];

          return {
            ...prevCards,
            [sourceColumnId]: sourceCards,
            [destinationColumnId]: destinationCards
          };
        });
      } catch (error) {
        console.error('Failed to update card column:', error.response.data.message);
      }
    } else {
      setCards(prevCards => {
        const columnCards = [...prevCards[sourceColumnId]];
        const [movedCard] = columnCards.splice(source.index, 1);
        columnCards.splice(destination.index, 0, movedCard);

        return {
          ...prevCards,
          [sourceColumnId]: columnCards
        };
      });
    }
  };

  const handleEditCard = async (card) => {
    setEditingCardId(card.id);
    setSelectedColumnId(card.columnId);
    setCardDetails({
      title: card.title || '',
      address: card.address || '',
      placeName: card.placeName || '',
      startedAt: card.startedAt || '',
      endedAt: card.endedAt || '',
      memo: card.memo || ''
    });

    try {
      const response = await apiClient.get(`/cards/${card.id}/posts`, {
        headers: {Authorization: `${localStorage.getItem('authToken')}`}
      });

      setRelatedPosts(response.data.data.contentList);
    } catch (error) {
      console.error('Failed to fetch related posts:', error.response.data.message);
    }
  };

  const handleCardDetailsChange = (e) => {
    const {name, value} = e.target;
    if (name === 'endedAt' && cardDetails.startedAt && value < cardDetails.startedAt) {
      alert('종료 시간은 시작 시간보다 빠를 수 없습니다.'); // Show an alert or handle error as you see fit
      return;
    }

    if (name === 'startedAt' && cardDetails.endedAt && value > cardDetails.endedAt) {
      alert('시작 시간은 종료 시간보다 늦을 수 없습니다.');
      return;
    }
    setCardDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSaveCardChanges = async () => {
    try {
      const formattedDetails = {
        ...cardDetails,
        startedAt: cardDetails.startedAt,
        endedAt: cardDetails.endedAt
      };
      await apiClient.patch(
          `/columns/${selectedColumnId}/cards/${editingCardId}`,
          formattedDetails,
          {
            headers: {
              Authorization: `${localStorage.getItem('authToken')}`
            }
          }
      );
      setEditingCardId(null);
      fetchColumns();
    } catch (error) {
      console.error('Failed to update card:', error.response.data.message);
    }
  };

  const handleSearch = (query) => {
    if (!mapsLoaded) {
      console.error('Kakao Maps API is not loaded');
      return;
    }

    const places = window.kakao.maps.services.Places;
    if (!places) {
      console.error('Places service is not available');
      return;
    }

    const ps = new places();
    ps.keywordSearch(query, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else {
        console.error('Search failed:', status);
      }
    });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    if (query.length > 2) {
      handleSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  const handlePlaceSelect = (place) => {
    setCardDetails(prevDetails => ({
      ...prevDetails,
      address: place.address_name,
      placeName: place.place_name
    }));
    setSearchResults([]);
  };
  const handleRelatedPostClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  const openInviteModal = () => {
    setInviteModalIsOpen(true);
  };

  const closeInviteModal = () => {
    setInviteModalIsOpen(false);
  };

  const handleInviteEmailChange = (e) => {
    setInviteEmail(e.target.value);
  };

  const handleInviteSubmit = async () => {
    try {
      await apiClient.post(`/plans/${plan.id}/invite`, {email: inviteEmail}, {
        headers: {Authorization: `${localStorage.getItem('authToken')}`}
      });
      closeInviteModal();
      alert("Invitation sent successfully!");
    } catch (error) {
      console.error('Failed to send invitation:', error.response.data.message);
    }
  };

  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  const openAddCardModal = () => {
    setIsAddCardModalOpen(true);
  };

  const closeAddCardModal = () => {
    setIsAddCardModalOpen(false);
  };


  const openAddColumnModal = () => {
    setIsAddColumnModalOpen(true);
  };

  const closeAddColumnModal = () => {
    setIsAddColumnModalOpen(false);
  };

  const handleAddColumnAndCloseModal = () => {
    handleAddColumn(); // 기존의 컬럼 추가 함수 호출
    closeAddColumnModal(); // 모달 닫기
  };

  const openEditCardModal = () => {
    setIsEditCardModalOpen(true);
  };

  const closeEditCardModal = () => {
    setIsEditCardModalOpen(false);
    setEditingCardId(null); // 모달 닫을 때, 수정 상태도 초기화
  };

  const handleSaveCardAndCloseModal = () => {
    handleSaveCardChanges(); // 기존의 카드 수정 함수 호출
    closeEditCardModal(); // 모달 닫기
  };

  const handleMouseEnter = (placeId) => {
    setHoveredItemId(placeId);
  };

  const handleMouseLeave = () => {
    setHoveredItemId(null);
  };


  return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            {isEditing ? (
                <>
                  <input
                      type="text"
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      style={{
                        ...styles.input,
                        fontSize: '16px',
                        padding: '5px'
                      }} // 입력 필드 스타일도 조정 가능
                  />
                  <button
                      onClick={handleTitleChange}
                      style={{
                        fontSize: '14px',
                        padding: '4px 8px',
                        marginRight: '5px'
                      }}
                  >
                    저장
                  </button>
                  <button
                      onClick={() => setIsEditing(false)}
                      style={{fontSize: '14px', padding: '4px 8px'}}
                  >
                    취소
                  </button>
                </>
            ) : (
                <>
                  {planTitle}
                  <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        fontSize: '14px',
                        padding: '4px 8px',
                        marginRight: '5px'
                      }}
                  >
                    수정
                  </button>
                  <button
                      onClick={deletePlan}
                      style={{fontSize: '14px', padding: '4px 8px'}}
                  >
                    삭제
                  </button>
                </>
            )}
          </div>

          <div style={{display: 'flex', alignItems: 'center'}}>
            {coworkers.map(coworker => (
                <img
                    key={coworker.id}
                    src={coworker.imageUrl}
                    alt={coworker.nickname}
                    style={styles.profileImage}
                    title={coworker.nickname}
                />
            ))}
            <button onClick={openInviteModal}> ➕</button>
          </div>
        </div>
        <div style={styles.mapContainer} ref={mapContainerRef}></div>


        {/* 일정 수정 모달 창 */}
        {editingCardId && isEditCardModalOpen && (
            <>
              <div style={styles.modalOverlay}
                   onClick={closeEditCardModal}></div>
              <div style={styles.modal}>
                <h3>일정 수정하기</h3>
                <input
                    type="text"
                    name="title"
                    value={cardDetails.title}
                    onChange={handleCardDetailsChange}
                    placeholder="제목"
                    style={styles.input}
                />
                <input
                    type="text"
                    placeholder="방문할 장소를 검색하세요 (최소 3자이상 입력)"
                    onChange={handleSearchChange}
                    style={styles.input}
                />
                <ul style={styles.searchResultList}>
                  {searchResults.map((place) => (
                      <li   key={place.id}
                            onClick={() => handlePlaceSelect(place)}
                            onMouseEnter={() => handleMouseEnter(place.id)}
                            onMouseLeave={handleMouseLeave}
                            style={{
                              ...styles.searchResultItem,
                              ...(hoveredItemId === place.id ? styles.searchResultItemHover : {}),
                            }}
                      >
                        {place.place_name} ({place.address_name})
                      </li>
                  ))}
                </ul>
                <input
                    type="text"
                    name="address"
                    value={cardDetails.address}
                    onChange={handleCardDetailsChange}
                    placeholder="방문할 장소의 주소"
                    style={styles.input}
                />
                <input
                    type="text"
                    name="placeName"
                    value={cardDetails.placeName}
                    onChange={handleCardDetailsChange}
                    placeholder="방문할 장소명"
                    style={styles.input}
                />
                <input
                    type="time"
                    name="startedAt"
                    value={cardDetails.startedAt}
                    onChange={handleCardDetailsChange}
                    placeholder="일정 시작 시간"
                    style={styles.input}
                />
                <input
                    type="time"
                    name="endedAt"
                    value={cardDetails.endedAt}
                    onChange={handleCardDetailsChange}
                    placeholder="일정 종료 시간"
                    style={styles.input}
                />
                <input
                    type="text"
                    name="memo"
                    value={cardDetails.memo}
                    onChange={handleCardDetailsChange}
                    placeholder="메모"
                    style={styles.input}
                />

                <div>
                  <h4>연관 게시물</h4>
                  {relatedPosts.length > 0 ? (
                      <ul>
                        {relatedPosts.map((post) => (
                            <li
                                key={post.id}
                                onClick={() => handleRelatedPostClick(post.id)}
                                style={{
                                  cursor: 'pointer',
                                  color: 'blue',
                                  textDecoration: 'underline',
                                }}
                            >
                              {post.title}
                            </li>
                        ))}
                      </ul>
                  ) : (
                      <p>추가된 연관 게시물이 없습니다.</p>
                  )}
                </div>
                <button style={styles.button}
                        onClick={handleSaveCardAndCloseModal}>
                  수정사항 저장
                </button>
                <button style={styles.buttonSecondary}
                        onClick={closeEditCardModal}>
                  취소
                </button>
              </div>
            </>
        )}

        {editModalVisible && (
            <>
              <div style={styles.modalOverlay}
                   onClick={handleCancelEdit}></div>
              <div style={styles.modal}>
                <input
                    type="text"
                    value={editColumnData.title}
                    onChange={(e) => setEditColumnData(
                        {...editColumnData, title: e.target.value})}
                    placeholder="여행 일차"
                    style={styles.modalInput}
                />
                <input
                    type="date"
                    value={editColumnData.date}
                    onChange={(e) => setEditColumnData(
                        {...editColumnData, date: e.target.value})}
                    style={styles.modalInput}
                />
                <button
                    onClick={handleSaveColumn}
                    style={{...styles.modalButton, ...styles.saveButton}}
                >
                  저장
                </button>
                <button
                    onClick={handleCancelEdit}
                    style={{...styles.modalButton, ...styles.cancelButton}}
                >
                  취소
                </button>
              </div>
            </>
        )}

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div style={styles.columnContainer}>
            {columns.map(column => (
                <Droppable key={column.id} droppableId={column.id.toString()}>
                  {(provided) => (
                      <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={styles.column}
                          onClick={openEditCardModal}
                      >
                        <h3>{column.title}</h3>
                        <button
                            style={styles.planDeleteButton}
                            onClick={(e) => {
                              e.stopPropagation();  // 이벤트 전파 방지
                              deleteColumn(column);
                            }}
                        >
                          삭제
                        </button>
                        <button
                            style={styles.button}
                            onClick={(e) => {
                              e.stopPropagation();  // 이벤트 전파 방지
                              handleEditColumn(column);
                            }}
                        >
                          수정
                        </button>
                        <p style={{color: '#999'}}>날짜: {column.date}</p>
                        {cards[column.id] && cards[column.id].map(
                            (card, index) => (
                                <Draggable key={card.id}
                                           draggableId={card.id.toString()}
                                           index={index}>
                                  {(provided) => (
                                      <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            ...styles.card,
                                            ...provided.draggableProps.style
                                          }}
                                          onClick={() => handleEditCard(card)}
                                      >
                                        <h4 style={styles.cardTitle}>{card.title}</h4>
                                        <button
                                            style={styles.planDeleteButton}
                                            onClick={(e) => {
                                              e.stopPropagation();  // 이벤트 전파 방지
                                              deleteCard(column, card);
                                            }}
                                        >
                                          삭제
                                        </button>
                                        <p style={styles.cardText}>📍위치: {card.placeName}</p>
                                        <p style={styles.cardText}>⏰시작
                                          시간: {card.startedAt}</p>
                                        <p style={styles.cardText}>⏰종료
                                          시간: {card.endedAt}</p>
                                      </div>
                                  )}
                                </Draggable>
                            )
                        )}

                        {/* + 버튼을 통해 모달 열기 */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <button onClick={openAddCardModal}
                                  style={{
                                    padding: '10px 20px',
                                    borderRadius: '15px',
                                    border: '2px solid #ccc',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '133px',
                                    height: '50px',
                                  }}>
                            일정 추가하기
                          </button>
                        </div>
                        {provided.placeholder}
                      </div>
                  )}
                </Droppable>
            ))}
          </div>
        </DragDropContext>


        {/* + 버튼을 통해 모달 열기 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button onClick={openAddColumnModal}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '15px',
                    border: '2px solid #ccc',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '133px',
                    height: '50px',
                  }}>
            일차 추가하기
          </button>
        </div>

        {/* 모달 창 */}
        {isAddColumnModalOpen && (
            <>
              <div style={styles.modalOverlay}
                   onClick={closeAddColumnModal}></div>
              <div style={styles.modal}>
                <h2>여행 일차 추가</h2>
                <div style={styles.formColumn}>
                  <input
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      placeholder="여행 일차를 적어주세요!"
                      style={{...styles.input, ...styles.formInput}}
                  />
                </div>
                <div style={styles.formColumn}>
                  <input
                      type="date"
                      value={newColumnDate}
                      onChange={(e) => setNewColumnDate(e.target.value)}
                      placeholder="Column Date"
                      style={{...styles.input, ...styles.formInput}}
                  />
                </div>
                <button
                    style={{...styles.button, ...styles.formButton}}
                    onClick={handleAddColumnAndCloseModal}
                >
                  여행 일차 추가하기
                </button>
                <button
                    style={{...styles.modalButton, ...styles.cancelButton}}
                    onClick={closeAddColumnModal}
                >
                  취소
                </button>
              </div>
            </>
        )}

        {isAddCardModalOpen && (
            <>
              <div style={styles.modalOverlay} onClick={closeAddCardModal}></div>
              <div style={styles.modal}>
                <div className="form">
                  <select
                      onChange={(e) => setSelectedColumnId(e.target.value)}
                      value={selectedColumnId || ''}
                      className="input formInput"
                  >
                    <option value="" disabled>
                      여행 일차를 선택해주세요
                    </option>
                    {columns.map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.title}
                        </option>
                    ))}
                  </select>
                  <input
                      type="text"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="일정 제목을 입력하세요"
                      className="input formInput"
                  />
                  <button className="button formButton" onClick={handleAddCard}>
                    일정 추가하기
                  </button>
                </div>
                <button style={styles.buttonSecondary} onClick={closeAddCardModal}>
                  취소
                </button>
              </div>
            </>
        )}


        {inviteModalIsOpen && (
            <>
              <div style={styles.modalOverlay} onClick={closeInviteModal}></div>
              <div style={styles.modal}>
                <h2>함께 여행 계획을 세울 유저를 초대하세요!</h2>
                <p>J의 안식처에 가입한 유저만 초대가 가능해요!</p>
                <input
                    type="email"
                    value={inviteEmail}
                    onChange={handleInviteEmailChange}
                    placeholder="이메일을 입력하세요"
                    style={styles.modalInput}
                />
                <button
                    onClick={handleInviteSubmit}
                    style={{...styles.modalButton, ...styles.saveButton}}
                >
                  초대하기
                </button>
                <button
                    onClick={closeInviteModal}
                    style={{...styles.modalButton, ...styles.cancelButton}}
                >
                  취소하기
                </button>
              </div>
            </>
        )}
      </div>
  );
}

export default Plan;
