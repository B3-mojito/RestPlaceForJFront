import React, { useState, useEffect } from 'react';
import {useNavigate} from "react-router-dom";
import apiClient from "../helpers/apiClient";

function PlanPage() {
    const [plans, setPlans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newPlanTitle, setNewPlanTitle] = useState('');
    const navigate = useNavigate(); // React Router's navigate function
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans/myPlans', {
                    headers: {
                        Authorization:  localStorage.getItem('authToken')
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
                        Authorization: localStorage.getItem('authToken') // Assuming you're using JWT
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
        <div style={{ padding: '20px' }}>
            <h1>나의 플랜</h1>
            {plans.length > 0 ? (
                <ul>
                    {plans.map((plan) => (
                        <li key={plan.id} onClick={() => navigate(`/plan/${plan.id}`, { state: { plan } })}>
                            {plan.title}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>아직 계획이 없습니다.</p>
            )}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button style={{
                    backgroundColor: '#007bff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    color: 'white',
                    fontSize: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer'
                }} onClick={() => setShowModal(true)}>
                    +
                </button>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
                }}>
                    <h2>새 플랜 추가</h2>
                    <input
                        type="text"
                        value={newPlanTitle}
                        onChange={(e) => setNewPlanTitle(e.target.value)}
                        placeholder="플랜 제목을 입력하세요"
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                    <button onClick={handleCreatePlan} style={{
                        backgroundColor: '#007bff',
                        border: 'none',
                        padding: '10px 20px',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }}>
                        저장
                    </button>
                    <button onClick={() => setShowModal(false)} style={{
                        backgroundColor: 'gray',
                        border: 'none',
                        padding: '10px 20px',
                        color: 'white',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        marginLeft: '10px'
                    }}>
                        취소
                    </button>
                </div>
            )}
        </div>
    );
}

export default PlanPage;