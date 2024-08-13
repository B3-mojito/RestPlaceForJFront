import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import apiClient from "../helpers/apiClient";
import { Modal, Button, Form } from 'react-bootstrap';

function PlanPage() {
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newPlanTitle, setNewPlanTitle] = useState('');
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
            setShowModal(false);
            setNewPlanTitle('');
        } catch (error) {
            console.error('Failed to create plan:', error);
        }
    };

    return (
        <div className="container my-4">
            <h1 className="text-center mb-4">나의 플랜</h1>
            {plans.length > 0 ? (
                <ul className="list-group">
                    {plans.map((plan) => (
                        <li
                            key={plan.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => navigate(`/plan/${plan.id}`, { state: { plan } })}
                            style={{ cursor: 'pointer' }}
                        >
                            {plan.title}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center">아직 계획이 없습니다.</p>
            )}

            <div className="text-center mt-4">
                <Button
                    variant="primary"
                    className="rounded-circle"
                    style={{ width: '50px', height: '50px', fontSize: '24px', lineHeight: '30px' }}
                    onClick={() => setShowModal(true)}
                >
                    +
                </Button>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
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
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={handleCreatePlan}>
                        저장
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PlanPage;
