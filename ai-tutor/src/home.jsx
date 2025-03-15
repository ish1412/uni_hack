import React from "react";
import "./home.css"; // Import custom CSS styles for the page

function Home() {
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
          <button className="cta-button">Try Now</button>
        </div>

        <div className="tool-card">
          <h2>Tutor 2</h2>
          <p>Boy</p>
          <button className="cta-button">Try Now</button>
        </div>

        <div className="tool-card">
          <h2>Tutor 3</h2>
          <p>Anime</p>
          <button className="cta-button">Try Now</button>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2025 AI Tools - All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default Home;
