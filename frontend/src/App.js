// import React from "react";
// import { Route, Routes } from "react-router-dom";

// function App() {
//   return <Routes></Routes>;
// }

// export default App;


import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const response = await axios.post('http://localhost:3000/chat', { message: input });
    setMessages([...messages, { sender: 'user', text: input }, ...response.data]);
    setInput('');
  };

  return (
    <div>
      <h1>Health Assistant Chatbot</h1>
      <div>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
