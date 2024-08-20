import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import apiClient from "../helpers/apiClient";
import {Button, Form, Modal} from 'react-bootstrap';
import './PlanPage.css'; // 새로운 CSS 파일로 스타일링

function PlanPage() {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const navigate = useNavigate();

  const fetchPlans = async () => {
    try {
      const response = await apiClient.get('/plans/myPlans', {
        headers: {
          Authorization: localStorage.getItem('authToken')
        }
      });
      setPlans(response.data.data);
    } catch (error) {
      console.error('유저정보가 일치하지 않거나', error.response.data.message);
    }
  };
  useEffect(() => {
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
      fetchPlans();
    } catch (error) {
      console.error('플랜 생성 실패:', error.response.data.message);
    }
  };

  return (
      <div className="plan-page-container">
        <h2 className="section-title">나의 플랜</h2>
        <div className="plans-list">
          {plans.length > 0 ? (
              plans.map((plan) => (
                  <div
                      key={plan.id}
                      className="plan-item"
                      onClick={() => navigate(`/plan/${plan.id}`,
                          {state: {plan}})}
                  >
                    {plan.title}
                  </div>
              ))
          ) : (
              <p className="no-plans">아직 계획이 없습니다.</p>
          )}
          <div className="add-button" onClick={() => setShowModal(true)}>+</div>
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
