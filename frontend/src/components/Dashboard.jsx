import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CSS/MedicineCard.css";  // Your existing CSS file

const baseURL = process.env.REACT_APP_API_BASE_URL;

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false); // Chat window state
  const chatMessagesRef = useRef(null); // To handle auto-scroll

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await axios.get(`${baseURL}/medicines`);
        setMedicines(response.data);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchMedicines();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/medicine/${id}`);
  };

  const sendMessage = async (messagePayload) => {
    const messageToSend = messagePayload || input;

    if (messageToSend.trim()) {
      const userMessage = { text: messageToSend, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput(""); // Clear the input field after sending

      try {
        const response = await axios.post("http://localhost:5005/webhooks/rest/webhook", {
          sender: "user", // Static sender ID, or generate dynamically
          message: messageToSend,
        });
        const botMessages = response.data.map((botMessage) => ({
          text: botMessage.text,
          buttons: botMessage.buttons || [], // Extract buttons if present
          sender: "bot",
        }));
        setMessages((prevMessages) => [...prevMessages, ...botMessages]);
      } catch (error) {
        console.error("Error communicating with Rasa:", error);
      }
    }
  };

  const handleButtonClick = (payload) => {
    sendMessage(payload);
  };

  // Automatically scroll to the latest message
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleChatClose = () => {
    setIsChatOpen(false);
    setMessages([]); // Clear the chat when closing
  };

  return (
    <div className="medicine-dashboard">
      {/* Medicine Cards */}
      {medicines.map((medicine) => (
        <div
          key={medicine._id}
          className="medicine-card"
          onClick={() => handleCardClick(medicine._id)}
        >
          <h3>{medicine.medicine_name}</h3>
          <p>Price: ${medicine.price}</p>
          <p>{medicine.description}</p>
        </div>
      ))}

      {/* Chatbot Icon and Window */}
      {isChatOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h4>Health Assistant</h4>
            <button className="chatbot-close" onClick={handleChatClose}>X</button>
          </div>
          <div className="chatbot-messages" ref={chatMessagesRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.sender === "user" ? "user-message" : "bot-message"}>
                {msg.text}
                {/* Display buttons if available */}
                {msg.buttons && (
                  <div className="chat-buttons">
                    {msg.buttons.map((button, index) => (
                      <button
                        key={index}
                        onClick={() => handleButtonClick(button.payload)}
                      >
                        {button.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={() => sendMessage()}>Send</button>
          </div>
        </div>
      ) : (
        <div className="chatbot-icon" onClick={() => setIsChatOpen(true)}>
          💬
        </div>
      )}
    </div>
  );
};

export default Dashboard;
