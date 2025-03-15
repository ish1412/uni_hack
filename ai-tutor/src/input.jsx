import React, { useState } from "react";
import "./Input.css"; // Import your custom CSS file for component-specific styling

const Input = () => {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

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

        <button className="submit-button">Submit</button>
      </div>
    </div>
  );
};

export default Input;
