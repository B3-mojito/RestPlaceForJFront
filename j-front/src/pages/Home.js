import React from "react";
import './Home.css';
import {Link} from "react-router-dom";
import Carousel from "react-bootstrap/Carousel";
import MainImage from "../component/MainImage";
import planImage from "../images/mainPlan.jpg"
import tripImage from "../images/mainTrip.jpg"
import mainPosting from "../images/mainPosting.jpg"

function Home(){
  return (
      <Carousel>
        <Carousel.Item>
          <Link to={"/post"}>
          <MainImage image={tripImage} text = "J의 여행" />
          </Link>
          <Carousel.Caption>
            <h3>추천 여행지 탐색</h3>
            <p>여러 장소를 공유하고 새로운 곳을 알아갈수 있는 기회!</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <Link to={"/plan"}>
          <MainImage image={planImage} text = "J의 계획" />
          </Link>
          <Carousel.Caption>
            <h3>여행 계획하기</h3>
            <p>여행 계획을 야무지게 짜볼 수 있는 기회!</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <Link to={"/posting"}>
          <MainImage image={mainPosting} text = "J의 기록" />
          </Link>
          <Carousel.Caption>
            <h3>여행 기록하기</h3>
            <p>여행 행적을 다른 사람에게 공유해보세요!</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

  );
}


export default Home;