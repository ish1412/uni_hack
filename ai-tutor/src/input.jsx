import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom"; // Import necessary routing components
import "./Input.css"; // Import your custom CSS file for component-specific styling
import Home from "./home"; // Import Home component

const Input = () => {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const navigate = useNavigate(); // Initialize navigate hook

  const handleSubmit = () => {
    // Redirect to Home page when the button is clicked
    navigate("/home");
  };

  return (
    <div className="centered-container">
      <div className="form-container">
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
        <Route path="/" element={<Input />} />
        <Route path="/home" element={<Home />} />{" "}
        {/* Define the route for the Home page */}
      </Routes>
    </Router>
  );
};

export default App;
