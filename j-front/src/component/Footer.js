import React from 'react';
import './Footer.css';
import githubImage from "../images/github.png"
import notionImage from "../images/notion.png"

const Footer = () => {
  return (
      <footer className="footer">
        <div className="footer-content">
          <h2>J의 안식처</h2>
          <p>모히또 가서 몰디브 한 잔</p>
          <a href="https://teamsparta.notion.site/2360237586194e21a8e4025d4355a764"
             target="_blank"
             rel="noopener noreferrer">
            <img
                src={notionImage}
                alt="Button Image"
            />
          </a>
          <a href="https://github.com/orgs/B3-mojito/repositories"
             target="_blank"
             rel="noopener noreferrer">
            <img
                src={githubImage}
                alt="Button Image"
            />
          </a>
        </div>
      </footer>
  );
};

export default Footer;
