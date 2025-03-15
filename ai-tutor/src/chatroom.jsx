// ChatRoom.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams to read dynamic route params
import "./chatroom.css"; // Import your custom CSS for chat room

const ChatRoom = () => {
  const { tutorId } = useParams(); // Get the tutorId from the URL
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");

      // Simulate an AI response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `AI Response for Tutor ${tutorId}: "${input}"`,
            sender: "ai",
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-window">
        <h2>Tutor {tutorId}</h2>
        <div className="messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === "user" ? "user" : "ai"}`}
            >
              <span>{message.text}</span>
            </div>
          ))}
        </div>
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatRoom;
