import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./home.css"; // Custom styles

function Home() {
  const navigate = useNavigate(); // Use the navigate hook for routing

  const handleTryNow = (tutorId) => {
    // Navigate to the chatroom with the tutorId parameter
    navigate(`/chatroom/${tutorId}`);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Welcome to AI tutors</h1>
        <p>Explore our AI-powered tutors</p>
      </header>

      <main className="main-content">
        <div className="tool-card">
          <h2>Tutor 1</h2>
          <p>Girl</p>
          <button className="cta-button" onClick={() => handleTryNow(1)}>
            Try Now
          </button>
        </div>

        <div className="tool-card">
          <h2>Tutor 2</h2>
          <p>Boy</p>
          <button className="cta-button" onClick={() => handleTryNow(2)}>
            Try Now
          </button>
        </div>

        <div className="tool-card">
          <h2>Tutor 3</h2>
          <p>Anime</p>
          <button className="cta-button" onClick={() => handleTryNow(3)}>
            Try Now
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2025 AI Tools - All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default Home;
