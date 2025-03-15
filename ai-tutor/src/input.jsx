import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom"; // Import routing components
import "./Input.css"; // Custom CSS for the page
import Home from "./home"; // Home component where the "Try Now" buttons are
import ChatRoom from "./chatroom"; // Chat room component for individual tutors

const Input = () => {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const navigate = useNavigate(); // Navigate hook for routing

  const handleSubmit = () => {
    // On submit, navigate to the Home page
    navigate("/home");
  };

  return (
    <div className="centered-container">
      <div className="form-container">
      <header className="header">
        <h1>Keen to learn and be empowered!?</h1>
        <p>Join now</p>
        </header>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Name"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Area of Study"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            className="input-field"
          />
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Input />} /> {/* Input form page */}
        <Route path="/home" element={<Home />} />{" "}
        {/* Home page with "Try Now" buttons */}
        <Route path="/chatroom/:tutorId" element={<ChatRoom />} />{" "}
        {/* Dynamic route for ChatRoom */}
      </Routes>
    </Router>
  );
};

export default App;
