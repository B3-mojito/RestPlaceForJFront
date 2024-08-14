import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from "../helpers/apiClient";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const styles = {
    container: {
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#333',
        backgroundColor: '#f9f9f9',
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
    button: {
        padding: '10px 20px',
        fontSize: '14px',
        borderRadius: '8px',
        backgroundColor: '#3b5998',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginLeft: '10px',
    },
    // 플랜 삭제 버튼
    planDeleteButton: {
        padding: '10px 20px',
        fontSize: '14px',
        borderRadius: '8px',
        backgroundColor: '#ff4d4f',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginLeft: '10px',
    },
    deleteButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '30px',
        height: '30px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
    },
    deleteButtonIcon: {
        position: 'relative',
        width: '20px',
        height: '20px',
    },
    xShape: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: '2px',
        backgroundColor: 'black',
        transform: 'translate(-50%, -50%) rotate(45deg)',
        content: '""',
    },
    xShapeAfter: {
        transform: 'translate(-50%, -50%) rotate(-45deg)',
    },
    buttonSecondary: {
        padding: '10px 20px',
        fontSize: '14px',
        borderRadius: '8px',
        backgroundColor: '#cccccc',
        color: '#333',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginLeft: '10px',
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
};

function Plan() {
    const location = useLocation();
    const { plan } = location.state;
    const [planTitle, setPlanTitle] = useState(plan.title);
    const [columns, setColumns] = useState([]);
    const [cards, setCards] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingCardId, setEditingCardId] = useState(null);
    const [newColumnDate, setNewColumnDate] = useState('');
    const [cardDetails, setCardDetails] = useState({
        title: '',
        address: '',
        placeName: '',
        startedAt: '',
        endedAt: '',
        memo: ''
    });
    const [newColumnTitle, setNewColumnTitle] = useState('default');
    const [newCardTitle, setNewCardTitle] = useState('default');
    const [newCardDescription, setNewCardDescription] = useState('');
    const [selectedColumnId, setSelectedColumnId] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [mapsLoaded, setMapsLoaded] = useState(false);

    const mapContainerRef = useRef(null);

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
        const scriptUrl = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=f90abf763c49b09ee81cd9b1f5f0b3ef&libraries=services,clusterer,drawing&autoload=false"
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
        const mapOptions = {
            center: new window.kakao.maps.LatLng(37.5665, 126.978),
            level: 3
        };

        const map = new window.kakao.maps.Map(mapContainer, mapOptions);
        const ps = new window.kakao.maps.services.Places();
        const geocoder = new window.kakao.maps.services.Geocoder();

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

            geocoder.coord2RegionCode(lng, lat, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const place = result[0];
                    setCardDetails(prevDetails => ({
                        ...prevDetails,
                        address: place.address_name,
                        placeName: place.place_name
                    }));
                } else {
                    console.error('Failed to get address from coordinates:', status);
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
            console.error('Failed to fetch plan data:', error);
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
            console.error('Failed to fetch columns:', error);
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
                console.error(`Failed to fetch cards for column ${column.id}:`, error);
            }
        }
        setCards(cardsData);
    };

    const handleTitleChange = async () => {
        try {
            await apiClient.patch(`/plans/${plan.id}`,
                { title: planTitle },
                { headers: { Authorization: `${localStorage.getItem('authToken')}` } }
            );
            setIsEditing(false);
            await fetchPlanData();
        } catch (error) {
            console.error('Failed to update plan title:', error);
        }
    };

    const handleAddColumn = async () => {
        try {
            const response = await apiClient.post(`/plans/${plan.id}/columns`,
                { title: newColumnTitle, date: newColumnDate },
                { headers: { Authorization: `${localStorage.getItem('authToken')}` } }
            );
            setColumns([...columns, response.data.data]);
            setNewColumnTitle('');
            setNewColumnDate('');
        } catch (error) {
            console.error('Failed to add column:', error);
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
                console.error('Error deleting plan:', error);
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
                console.log("컬럼 삭제 완료");
                fetchColumns();
            } catch (error) {
                console.error('Error deleting plan:', error);
            }
        } else {
            console.log("컬럼 삭제가 취소되었습니다.");
        }
    };

    // 카드 삭제 함수
    const deleteCard = async (column, card) => {
        // 사용자에게 경고창을 띄워 확인 요청
        const confirmed = window.confirm("정말로 이 카드을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");

        // 사용자가 확인을 누른 경우에만 삭제 작업 진행
        if (confirmed) {
            try {
                await apiClient.delete(`/columns/${column.id}/cards/${card.id}`);

                console.log("카드 삭제 완료");
                fetchColumns();
            } catch (error) {
                console.error('Error deleting plan:', error);
            }
        } else {
            console.log("카드 삭제가 취소되었습니다.");
        }
    };

    const handleAddCard = async () => {
        if (!selectedColumnId) {
            console.error('No column selected');
            return;
        }
        try {
            const response = await apiClient.post(`/columns/${selectedColumnId}/cards`,
                { title: newCardTitle, description: newCardDescription },
                { headers: { Authorization: `${localStorage.getItem('authToken')}` } }
            );
            setCards({
                ...cards,
                [selectedColumnId]: [...(cards[selectedColumnId] || []), response.data.data]
            });
            setNewCardTitle('');
            setNewCardDescription('');
        } catch (error) {
            console.error('Failed to add card:', error);
        }
    };

    const handleOnDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const sourceColumnId = parseInt(source.droppableId);
        const destinationColumnId = parseInt(destination.droppableId);
        const cardId = parseInt(draggableId);

        if (sourceColumnId !== destinationColumnId) {
            try {
                await apiClient.patch(`/columns/${destinationColumnId}/cards/${cardId}/moveColumn`, {}, {
                    headers: {
                        Authorization: `${localStorage.getItem('authToken')}`
                    }
                });

                setCards(prevCards => {
                    const sourceCards = prevCards[sourceColumnId].filter(card => card.id !== cardId);
                    const card = prevCards[sourceColumnId].find(card => card.id === cardId);
                    const destinationCards = [...(prevCards[destinationColumnId] || []), card];

                    return {
                        ...prevCards,
                        [sourceColumnId]: sourceCards,
                        [destinationColumnId]: destinationCards
                    };
                });
            } catch (error) {
                console.error('Failed to update card column:', error);
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

    const handleEditCard = (card) => {
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
    };

    const handleCardDetailsChange = (e) => {
        const { name, value } = e.target;
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
            await apiClient.patch(`/columns/${selectedColumnId}/cards/${editingCardId}`,
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
            console.error('Failed to update card:', error);
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

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                {isEditing ? (
                    <div>
                        <input
                            type="text"
                            value={planTitle}
                            onChange={(e) => setPlanTitle(e.target.value)}
                            style={styles.input}
                        />
                        <button style={styles.button} onClick={handleTitleChange}>Save</button>
                        <button style={styles.buttonSecondary} onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                ) : (
                    <div>
                        {planTitle}
                        <button style={styles.button} onClick={() => setIsEditing(true)}>Edit</button>
                        <button style={styles.planDeleteButton} onClick={() => deletePlan()}>delete</button>
                    </div>
                )}
            </div>
            <div style={styles.mapContainer} ref={mapContainerRef}></div>
            <div style={styles.form}>
                <div style={styles.formColumn}>
                    <input
                        type="text"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="New column title"
                        style={{ ...styles.input, ...styles.formInput }}
                    />
                </div>
                <div style={styles.formColumn}>
                    <input
                        type="date"
                        value={newColumnDate}
                        onChange={(e) => setNewColumnDate(e.target.value)}
                        placeholder="Column Date"
                        style={{ ...styles.input, ...styles.formInput }}
                    />
                </div>
                <button style={{ ...styles.button, ...styles.formButton }} onClick={handleAddColumn}>Add Column</button>
            </div>

            <div style={styles.form}>
                <select
                    onChange={(e) => setSelectedColumnId(e.target.value)}
                    value={selectedColumnId || ''}
                    style={{ ...styles.input, ...styles.formInput }}
                >
                    <option value="" disabled>Select column</option>
                    {columns.map((column) => (
                        <option key={column.id} value={column.id}>{column.title}</option>
                    ))}
                </select>
                <input
                    type="text"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="New card title"
                    style={{ ...styles.input, ...styles.formInput }}
                />
                <input
                    type="text"
                    value={newCardDescription}
                    onChange={(e) => setNewCardDescription(e.target.value)}
                    placeholder="Card description"
                    style={{ ...styles.input, ...styles.formInput }}
                />
                <button style={{ ...styles.button, ...styles.formButton }} onClick={handleAddCard}>Add Card</button>
            </div>

            {editingCardId && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Edit Card</h3>
                    <input
                        type="text"
                        name="title"
                        value={cardDetails.title}
                        onChange={handleCardDetailsChange}
                        placeholder="Title"
                        style={styles.input}
                    />
                    <input
                        type="text"
                        name="address"
                        value={cardDetails.address}
                        onChange={handleCardDetailsChange}
                        placeholder="Address"
                        style={styles.input}
                    />
                    <input
                        type="text"
                        name="placeName"
                        value={cardDetails.placeName}
                        onChange={handleCardDetailsChange}
                        placeholder="Place Name"
                        style={styles.input}
                    />
                    <input
                        type="time"
                        name="startedAt"
                        value={cardDetails.startedAt}
                        onChange={handleCardDetailsChange}
                        placeholder="Start Time"
                        style={styles.input}
                    />
                    <input
                        type="time"
                        name="endedAt"
                        value={cardDetails.endedAt}
                        onChange={handleCardDetailsChange}
                        placeholder="End Time"
                        style={styles.input}
                    />
                    <input
                        type="text"
                        name="memo"
                        value={cardDetails.memo}
                        onChange={handleCardDetailsChange}
                        placeholder="Memo"
                        style={styles.input}
                    />
                    <div>
                        <input
                            type="text"
                            placeholder="Search for places"
                            onChange={handleSearchChange}
                            style={styles.input}
                        />
                        <ul>
                            {searchResults.map((place) => (
                                <li key={place.id} onClick={() => handlePlaceSelect(place)}>
                                    {place.place_name} ({place.address_name})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button style={styles.button} onClick={handleSaveCardChanges}>Save Changes</button>
                    <button style={styles.buttonSecondary} onClick={() => setEditingCardId(null)}>Cancel</button>
                </div>
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
                                >
                                    <h3>{column.title}</h3>
                                    <button style={styles.planDeleteButton}
                                            onClick={() => deleteColumn(column)}>delete
                                    </button>
                                    <p style={{color: '#999'}}>Date: {column.date}</p>
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
                                                        onClick={() => handleEditCard(
                                                            card)}
                                                    >
                                                        <h4 style={styles.cardTitle}>{card.title}</h4>
                                                        <button
                                                            style={styles.planDeleteButton}
                                                            onClick={() => deleteCard(column, card)}>delete
                                                        </button>

                                                        <p style={styles.cardText}>Place: {card.placeName}</p>
                                                        <p style={styles.cardText}>Start: {card.startedAt}</p>
                                                        <p style={styles.cardText}>End: {card.endedAt}</p>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}

export default Plan;
