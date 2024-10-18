import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CSS/MedicineCard.css";
import Navbar from "./Navbar";
import { IoIosSend } from "react-icons/io";

const baseURL = process.env.REACT_APP_API_BASE_URL;
const image = process.env.PUBLIC_URL;

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatMessagesRef = useRef(null);

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

  const handlePurchaseClick = (checkoutUrl) => {
    window.open(checkoutUrl, "_blank");
  };

  const sendMessage = async (messagePayload) => {
    const messageToSend = messagePayload || input;

    if (messageToSend.trim()) {
      const userMessage = { text: messageToSend, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");

      try {
        const response = await axios.post(
          "http://localhost:5005/webhooks/rest/webhook",
          {
            sender: "user",
            message: messageToSend,
          }
        );

        const botMessages = response.data.map((botMessage) => ({
          text: botMessage.text,
          buttons: botMessage.buttons || [],
          image: botMessage.image || "",
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

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleChatClose = () => {
    setIsChatOpen(false);
    setMessages([]);
  };

  return (
    <>
      <Navbar />
      <div className="medicine-dashboard">
        {medicines.map((medicine) => (
          <div
            key={medicine._id}
            className="medicine-card"
            onClick={() => handleCardClick(medicine._id)}
          >
            <img
              src={`${image}/${medicine.image}`}
              alt="Medicine Image"
              style={{ height: "75%", maxWidth: "100%" }}
            />
            <h3>{medicine.medicine_name}</h3>
            <p>Price: ${medicine.price}</p>
            <p>{medicine.description}</p>
          </div>
        ))}
        {isChatOpen ? (
          <div className="chatbot-container">
            <div className="chatbot-header">
              <h4>Health Assistant</h4>
              <button className="chatbot-close" onClick={handleChatClose}>
                X
              </button>
            </div>
            <div className="chatbot-messages" ref={chatMessagesRef}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.sender === "user" ? "user-message" : "bot-message"
                  }
                >
                  {msg.text && msg.text}
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Medicine"
                      className="chat-image"
                    />
                  )}
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
                  {msg.buttons && (
                    <div className="chat-buttons">
                      {msg.text && msg.text.includes("Checkout Page") && (
                        <button
                          onClick={() =>
                            handlePurchaseClick(
                              msg.text.match(/http[s]?:\/\/[^\s\)]+/g)[0]
                            )
                          }
                        >
                          Complete Purchase
                        </button>
                      )}
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
              <button
                style={{ height: "40px", width: "50px" }}
                onClick={() => sendMessage()}
              >
                <IoIosSend size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="chatbot-icon" onClick={() => setIsChatOpen(true)}>
            💬
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
