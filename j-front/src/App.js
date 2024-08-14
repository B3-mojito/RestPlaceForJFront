import './App.css';
import React, {useState, useEffect, Suspense, lazy} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from "./component/Header";
import 'bootstrap/dist/css/bootstrap.min.css';
import SignUp from "./component/SignUp";
import Post from "./pages/Post";
import Posting from "./pages/Posting";
import MyPage from "./component/MyPage.js";
import ProtectedRoute from "./context/ProtectedRoute";
import Plan from './component/PlanView';
import PlanPage from "./component/PlanPage";
import PostDetail from "./component/PostDetail"; // Plan 컴포넌트 임포트

const Login = lazy(() => import('./component/Login'));
const Home = lazy(() => import('./pages/Home'));

function App() {
    const [showSignUp, setShowSignUp] = useState(true);

    // Define the toggle function
    const handleToggle = () => {
        setShowSignUp(!showSignUp);
    };
    return (
        <Router>
            <Header />
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<ProtectedRoute component={Home} />} />
                    <Route path="/login" element={<Login toggle={handleToggle} />} />
                    <Route path="/signup" element={<SignUp toggle={handleToggle} />} />
                    <Route path="/post" element={<Post />} />
                    <Route path="/posts/:postId" element={<PostDetail />} />
                    <Route path="/posting" element={<Posting />} />
                    <Route path="/mypage" element={<MyPage toggle={handleToggle}/>} />
                    <Route path="/plan" element={<PlanPage />} />
                    <Route path="/plan/:id" element={<Plan />} />
                    <Route path="/" element={<Navigate to="/home" />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
