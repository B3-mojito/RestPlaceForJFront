import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from "../helpers/apiClient";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [newCardTitle, setNewCardTitle] = useState('');
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

    const loadKakaoMapsScript = () => {
        const scriptUrl = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=a84090a0ae739cccb8c34d58fca902b1&libraries=services,clusterer,drawing&autoload=false";
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

        document.getElementById('search-input').addEventListener('input', handleSearchInput);

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
        <div style={{ padding: '20px' }}>
            <h1>
                {isEditing ? (
                    <div>
                        <input
                            type="text"
                            value={planTitle}
                            onChange={(e) => setPlanTitle(e.target.value)}
                            style={{ marginRight: '10px' }}
                        />
                        <button onClick={handleTitleChange}>Save</button>
                        <button onClick={() => setIsEditing(false)}
                                style={{ marginLeft: '10px' }}>Cancel
                        </button>
                    </div>
                ) : (
                    <div>
                        {planTitle}
                        <button onClick={() => setIsEditing(true)}
                                style={{ marginLeft: '20px' }}>Edit
                        </button>
                    </div>
                )}
            </h1>
            <div style={{ marginBottom: '20px' }}>
                <input
                    id="search-input"
                    type="text"
                    placeholder="Search for places"
                    style={{ marginBottom: '10px' }}
                />
                <div ref={mapContainerRef} style={{
                    width: '100%',
                    height: '400px',
                    marginBottom: '20px'
                }}></div>

            </div>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="New column title"
                    style={{ marginRight: '10px' }}
                />
                <input
                    type="date"
                    value={newColumnDate}
                    onChange={(e) => setNewColumnDate(e.target.value)}
                    placeholder="Column Date"
                    style={{ marginRight: '10px' }}
                />
                <button onClick={handleAddColumn}>Add Column</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <select onChange={(e) => setSelectedColumnId(e.target.value)}
                        value={selectedColumnId || ''}>
                    <option value="" disabled>Select column</option>
                    {columns.map((column) => (
                        <option key={column.id}
                                value={column.id}>{column.title}</option>
                    ))}
                </select>
                <input
                    type="text"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="New card title"
                    style={{ marginRight: '10px' }}
                />
                <input
                    type="text"
                    value={newCardDescription}
                    onChange={(e) => setNewCardDescription(e.target.value)}
                    placeholder="Card description"
                    style={{ marginRight: '10px' }}
                />
                <button onClick={handleAddCard}>Add Card</button>
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
                        style={{ marginBottom: '10px' }}
                    />
                    <input
                        type="text"
                        name="address"
                        value={cardDetails.address}
                        onChange={handleCardDetailsChange}
                        placeholder="Address"
                        style={{ marginBottom: '10px' }}
                    />
                    <input
                        type="text"
                        name="placeName"
                        value={cardDetails.placeName}
                        onChange={handleCardDetailsChange}
                        placeholder="Place Name"
                        style={{ marginBottom: '10px' }}
                    />
                    <input
                        type="time"
                        name="startedAt"
                        value={cardDetails.startedAt}
                        onChange={handleCardDetailsChange}
                        placeholder="Start Time"
                        style={{ marginBottom: '10px' }}
                    />
                    <input
                        type="time"
                        name="endedAt"
                        value={cardDetails.endedAt}
                        onChange={handleCardDetailsChange}
                        placeholder="End Time"
                        style={{ marginBottom: '10px' }}
                    />
                    <input
                        type="text"
                        name="memo"
                        value={cardDetails.memo}
                        onChange={handleCardDetailsChange}
                        placeholder="Memo"
                        style={{ marginBottom: '10px' }}
                    />
                    <div>
                        <input
                            type="text"
                            placeholder="Search for places"
                            onChange={handleSearchChange}
                        />
                        <ul>
                            {searchResults.map((place) => (
                                <li key={place.id}
                                    onClick={() => handlePlaceSelect(place)}>
                                    {place.place_name} ({place.address_name})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={handleSaveCardChanges}>Save Changes
                    </button>
                    <button onClick={() => setEditingCardId(null)}>Cancel
                    </button>
                </div>
            )}

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <div style={{ display: 'flex' }}>
                    {columns.map(column => (
                        <Droppable key={column.id}
                                   droppableId={column.id.toString()}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{
                                        padding: '10px',
                                        width: '300px',
                                        minHeight: '100px',
                                        backgroundColor: '#f0f0f0',
                                        margin: '10px',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <h3>{column.title}</h3>
                                    <p>Date: {column.date}</p>
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
                                                            ...provided.draggableProps.style,
                                                            padding: '15px',
                                                            margin: '10px 0',
                                                            backgroundColor: '#ffffff',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'space-between',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleEditCard(
                                                            card)}
                                                    >
                                                        <h4>{card.title}</h4>
                                                        <p>Place: {card.placeName}</p>
                                                        <p>Start: {card.startedAt}</p>
                                                        <p>End: {card.endedAt}</p>
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
