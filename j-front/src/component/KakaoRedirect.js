import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const LoginHandler = () => {
  const navigate = useNavigate();
  const code = new URL(window.location.href).searchParams.get("code");

  const kakaoLogin = async () => {
    try {
      const response = await axios.get(
          `https://api.restplaceforj.com/v1/users/kakao/callback?code=${code}`, {
            withCredentials: true,  // 필요한 경우 쿠키를 포함하여 요청
          });

      // 헤더에서 토큰 가져오기
      const accessToken = response.headers.get('Authorization');
      const refreshToken = response.headers.get('RefreshToken');
      console.log(accessToken);
      console.log(refreshToken);

      // 로컬 스토리지에 토큰 저장
      if (accessToken) {
        localStorage.setItem("authToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("RefreshToken", refreshToken);
      }

      // 로그인이 성공하면 이동할 페이지로 리디렉트
      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error.response.data.message);
      // 실패 시 적절한 에러 처리
    }
  };
  useEffect(() => {

    if (code) {
      kakaoLogin();
    }
  }, [code, navigate]);

  return (
      <div>
        <p>로그인 중입니다. 잠시만 기다려주세요...</p>
      </div>
  );
};

export default LoginHandler;
