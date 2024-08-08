import React, { useEffect, useRef, useState } from 'react';
import './Plan.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const Plan = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [emailModalIsOpen, setEmailModalIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [collaborators, setCollaborators] = useState([
        { id: 1, src: '/path/to/collaborator1.jpg', alt: 'Collaborator 1' },
        { id: 2, src: '/path/to/collaborator2.jpg', alt: 'Collaborator 2' },
        { id: 3, src: '/path/to/collaborator3.jpg', alt: 'Collaborator 3' },
    ]);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState('Your Plan Title');
    const [columns, setColumns] = useState([
        {
            id: 1,
            title: '미정',
            date: '',
            items: [
                { id: 1, title: 'Item 1', address: 'Address 1', dates: '2023-01-01 - 2023-01-02', memo: 'Memo 1', related: ['Related Post 1', 'Related Post 2'] },
                { id: 2, title: 'Item 2', address: 'Address 2', dates: '2023-01-03 - 2023-01-04', memo: 'Memo 2', related: [] },
            ],
        },
        {
            id: 2,
            title: 'Column 2',
            date: '2023-01-05',
            items: [
                { id: 3, title: 'Item 3', address: 'Address 3', dates: '2023-01-05 - 2023-01-06', memo: 'Memo 3', related: ['Related Post 3'] },
                { id: 4, title: 'Item 4', address: 'Address 4', dates: '2023-01-07 - 2023-01-08', memo: 'Memo 4', related: [] },
            ],
        },
    ]);
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [newCardAddress, setNewCardAddress] = useState('');
    const [newCardDates, setNewCardDates] = useState('');
    const [newCardMemo, setNewCardMemo] = useState('');
    const [targetColumnId, setTargetColumnId] = useState(null);
    const mapContainerRef = useRef(null);

    const openModal = (card) => {
        setSelectedCard(card);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedCard(null);
    };

    const openEditModal = (card) => {
        setSelectedCard(card);
        setEditModalIsOpen(true);
        setModalIsOpen(false); // close the view modal
    };

    const closeEditModal = () => {
        setEditModalIsOpen(false);
        setSelectedCard(null);
    };

    const openEmailModal = () => {
        setEmailModalIsOpen(true);
    };

    const closeEmailModal = () => {
        setEmailModalIsOpen(false);
    };

    const handleInvite = () => {
        const newCollaborator = {
            id: collaborators.length + 1,
            src: '/path/to/default-profile.jpg',
            alt: email,
        };
        setCollaborators([...collaborators, newCollaborator]);
        closeEmailModal();
    };

    const handleTitleEdit = () => {
        setIsEditingTitle(true);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleTitleSave = () => {
        setIsEditingTitle(false);
    };

    const handleTitleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        }
    };

    const handleDelete = () => {
        const confirmed = window.confirm('정말 삭제하시겠어요?');
        if (confirmed) {
            console.log('Item deleted');
        }
    };

    const moveCard = (cardId, targetColumnId) => {
        setColumns((prevColumns) => {
            const newColumns = prevColumns.map((column) => {
                const items = column.items.filter((item) => item.id !== cardId);
                return { ...column, items };
            });

            const card = prevColumns
                .flatMap((column) => column.items)
                .find((item) => item.id === cardId);

            return newColumns.map((column) => {
                if (column.id === targetColumnId) {
                    return { ...column, items: [...column.items, card] };
                }
                return column;
            });
        });
    };

    const PlanItem = ({ item }) => {
        const [{ isDragging }, drag] = useDrag({
            type: 'CARD',
            item: { id: item.id },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        return (
            <div className="plan-item" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} onClick={() => openModal(item)}>
                <h3 className="item-title">{item.title}</h3>
                <p className="item-address">{item.address}</p>
                <p className="item-dates">{item.dates}</p>
            </div>
        );
    };

    const PlanColumn = ({ column }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [columnTitle, setColumnTitle] = useState(column.title);
        const [columnDate, setColumnDate] = useState(column.date);

        const [{ isOver }, drop] = useDrop({
            accept: 'CARD',
            drop: (item) => {
                moveCard(item.id, column.id);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        });

        const handleEdit = () => {
            setIsEditing(true);
        };

        const handleSave = () => {
            setColumns((prevColumns) =>
                prevColumns.map((col) =>
                    col.id === column.id
                        ? { ...col, title: columnTitle, date: columnDate }
                        : col
                )
            );
            setIsEditing(false);
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                handleSave();
            }
        };

        const handleColumnDelete = () => {
            const confirmed = window.confirm('정말 삭제하시겠어요?');
            if (confirmed) {
                setColumns((prevColumns) => prevColumns.filter((col) => col.id !== column.id));
            }
        };

        const handleAddCard = () => {
            setColumns((prevColumns) =>
                prevColumns.map((col) =>
                    col.id === column.id
                        ? {
                            ...col,
                            items: [
                                ...col.items,
                                {
                                    id: Math.max(...col.items.map(item => item.id)) + 1,
                                    title: newCardTitle,
                                    address: newCardAddress,
                                    dates: newCardDates,
                                    memo: newCardMemo,
                                    related: [],
                                },
                            ],
                        }
                        : col
                )
            );
            setIsAddCardModalOpen(false);
            setNewCardTitle('');
            setNewCardAddress('');
            setNewCardDates('');
            setNewCardMemo('');
        };

        return (
            <div className="plan-list" ref={drop} style={{ backgroundColor: isOver ? '#f0f0f0' : 'inherit' }}>
                <header>
                    {isEditing ? (
                        <div>
                            <input
                                type="text"
                                value={columnTitle}
                                onChange={(e) => setColumnTitle(e.target.value)}
                                onKeyPress={handleKeyPress}
                                autoFocus
                            />
                            <input
                                type="text"
                                value={columnDate}
                                onChange={(e) => setColumnDate(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button onClick={handleSave}>저장</button>
                        </div>
                    ) : (
                        <div>
                            <h3 className="column-title">{column.title}</h3>
                            <h2 className="column-date">{column.date}</h2>
                            <div className="actions">
                                <button onClick={handleEdit}>수정</button>
                                <button onClick={handleColumnDelete}>삭제</button>
                            </div>
                        </div>
                    )}
                </header>
                {column.items.map((item) => (
                    <PlanItem key={item.id} item={item} />
                ))}
                <button className="add-plan-button" onClick={() => { setIsAddCardModalOpen(true); setTargetColumnId(column.id); }}>+</button>

                {isAddCardModalOpen && targetColumnId === column.id && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-modal" onClick={() => setIsAddCardModalOpen(false)}>X</button>
                            <h2>카드 제목을 입력하세요</h2>
                            <input
                                type="text"
                                value={newCardTitle}
                                onChange={(e) => setNewCardTitle(e.target.value)}
                                placeholder="카드 제목을 입력하세요"
                            />
                            <input
                                type="text"
                                value={newCardAddress}
                                onChange={(e) => setNewCardAddress(e.target.value)}
                                placeholder="주소를 입력하세요"
                            />
                            <input
                                type="text"
                                value={newCardDates}
                                onChange={(e) => setNewCardDates(e.target.value)}
                                placeholder="날짜를 입력하세요"
                            />
                            <input
                                type="text"
                                value={newCardMemo}
                                onChange={(e) => setNewCardMemo(e.target.value)}
                                placeholder="메모를 입력하세요"
                            />
                            <button onClick={handleAddCard}>확인</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const PlanModal = ({ card, isOpen, onClose, onEdit }) => {
        if (!isOpen || !card) return null;

        const handleCardDelete = () => {
            const confirmed = window.confirm('정말 삭제하시겠어요?');
            if (confirmed) {
                setColumns((prevColumns) => {
                    return prevColumns.map((column) => ({
                        ...column,
                        items: column.items.filter((item) => item.id !== card.id),
                    }));
                });
                onClose();
            }
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <button className="close-modal" onClick={onClose}>
                        X
                    </button>
                    <h2>{card.title}</h2>
                    <p>{card.address}</p>
                    <p>{card.dates}</p>
                    <p>{card.memo}</p>
                    <h3>연관게시물</h3>
                    {card.related.length > 0 ? (
                        card.related.map((post, index) => (
                            <p key={index}>{post}</p>
                        ))
                    ) : (
                        <p>(등록된 연관 게시물이 없을 경우) 연관 게시물이 없습니다</p>
                    )}
                    <button onClick={() => onEdit(card)}>수정</button>
                    <button onClick={handleCardDelete}>삭제</button>
                </div>
            </div>
        );
    };

    const EditCardModal = ({ card, isOpen, onClose, onSave }) => {
        const [editCardTitle, setEditCardTitle] = useState(card ? card.title : '');
        const [editCardAddress, setEditCardAddress] = useState(card ? card.address : '');
        const [editCardDates, setEditCardDates] = useState(card ? card.dates : '');
        const [editCardMemo, setEditCardMemo] = useState(card ? card.memo : '');

        useEffect(() => {
            if (card) {
                setEditCardTitle(card.title);
                setEditCardAddress(card.address);
                setEditCardDates(card.dates);
                setEditCardMemo(card.memo);
            }
        }, [card]);

        if (!isOpen || !card) return null;

        const handleSave = () => {
            onSave({ ...card, title: editCardTitle, address: editCardAddress, dates: editCardDates, memo: editCardMemo });
            onClose();
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <button className="close-modal" onClick={onClose}>
                        X
                    </button>
                    <h2>카드 제목을 입력하세요</h2>
                    <input
                        type="text"
                        value={editCardTitle}
                        onChange={(e) => setEditCardTitle(e.target.value)}
                        placeholder="카드 제목을 입력하세요"
                    />
                    <input
                        type="text"
                        value={editCardAddress}
                        onChange={(e) => setEditCardAddress(e.target.value)}
                        placeholder="주소를 입력하세요"
                    />
                    <input
                        type="text"
                        value={editCardDates}
                        onChange={(e) => setEditCardDates(e.target.value)}
                        placeholder="날짜를 입력하세요"
                    />
                    <input
                        type="text"
                        value={editCardMemo}
                        onChange={(e) => setEditCardMemo(e.target.value)}
                        placeholder="메모를 입력하세요"
                    />
                    <button onClick={handleSave}>수정하기</button>
                </div>
            </div>
        );
    };

    const handleCardEdit = (updatedCard) => {
        setColumns((prevColumns) =>
            prevColumns.map((column) =>
                column.id === columns.find(col => col.items.some(item => item.id === updatedCard.id)).id
                    ? {
                        ...column,
                        items: column.items.map((item) =>
                            item.id === updatedCard.id ? updatedCard : item
                        ),
                    }
                    : column
            )
        );
        setSelectedCard(null);
        setEditModalIsOpen(false);
    };

    const handleAddCard = () => {
        setColumns((prevColumns) =>
            prevColumns.map((column) => {
                if (column.id === targetColumnId) {
                    return {
                        ...column,
                        items: [
                            ...column.items,
                            {
                                id: Math.random(),
                                title: newCardTitle,
                                address: newCardAddress,
                                dates: newCardDates,
                                memo: newCardMemo,
                                related: [],
                            },
                        ],
                    };
                }
                return column;
            })
        );
        setIsAddCardModalOpen(false);
        setNewCardTitle('');
        setNewCardAddress('');
        setNewCardDates('');
        setNewCardMemo('');
        setTargetColumnId(null);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="plan-container">
                <header>
                    <div className="title-container">
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                onKeyPress={handleTitleKeyPress}
                                onBlur={handleTitleSave}
                                autoFocus
                            />
                        ) : (
                            <h1 onClick={handleTitleEdit}>{title}</h1>
                        )}
                        {!isEditingTitle && (
                            <div className="actions">
                                <button onClick={handleTitleEdit}>수정</button>
                                <button onClick={handleDelete}>삭제</button>
                            </div>
                        )}
                    </div>
                    <div className="collaborators">
                        {collaborators.map((collaborator) => (
                            <img
                                key={collaborator.id}
                                src={collaborator.src}
                                alt={collaborator.alt}
                                className="collaborator-photo"
                            />
                        ))}
                        <button className="add-collaborator-button" onClick={openEmailModal}>
                            +
                        </button>
                    </div>
                </header>
                <div className="map-container" ref={mapContainerRef} style={{ height: '400px', position: 'relative' }}></div>
                <div className="plan-lists">
                    {columns.map((column) => (
                        <PlanColumn key={column.id} column={column} />
                    ))}
                    <button
                        className="add-column-button"
                        onClick={() =>
                            setColumns([
                                ...columns,
                                {
                                    id: Math.random(),
                                    title: '새로운 칼럼',
                                    date: '',
                                    items: [],
                                },
                            ])
                        }
                    >
                        컬럼 추가하기
                    </button>
                </div>

                {modalIsOpen && (
                    <PlanModal card={selectedCard} isOpen={modalIsOpen} onClose={closeModal} onEdit={openEditModal} />
                )}

                {editModalIsOpen && (
                    <EditCardModal
                        card={selectedCard}
                        isOpen={editModalIsOpen}
                        onClose={closeEditModal}
                        onSave={handleCardEdit}
                    />
                )}

                {emailModalIsOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-modal" onClick={closeEmailModal}>X</button>
                            <h2>함께 플랜을 짤 동행인을 초대하세요!</h2>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="동행인의 이메일을 입력해주세요"
                            />
                            <button onClick={handleInvite}>초대하기</button>
                        </div>
                    </div>
                )}
            </div>
        </DndProvider>
    );
};

export default Plan;
