import React, { useState } from 'react';
import axios from 'axios';

function CustomerService() {
  const [selectedOption, setSelectedOption] = useState('submit'); // 'submit' or 'analyze'
  const [ticketNumber, setTicketNumber] = useState('');
  const [description, setDescription] = useState('');
  const [ticketImage, setTicketImage] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle ticket number change for both forms
  const handleTicketNumberChange = (e) => {
    setTicketNumber(e.target.value);
  };

  // Handle description change
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Handle image file change
  const handleImageChange = (e) => {
    setTicketImage(e.target.files[0]);
  };

  // Handle submit ticket form
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('description', description);
    formData.append('ticketImage', ticketImage);

    try {
      const response = await axios.post('http://localhost:3006/api/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTicketNumber(response.data.ticketNumber); // Display generated ticket number
      setResponseMessage(response.data.message);
    } catch (error) {
      setResponseMessage('Error submitting ticket');
      console.error(error);
    }
  };

  // Handle analyze ticket
  const handleAnalyzeTicket = async () => {
    try {
      const response = await axios.get(`http://localhost:3006/api/tickets/analyze/${ticketNumber}`);
      setAnalysisResult(response.data.decision);
      setErrorMessage('');
    } catch (error) {
      setAnalysisResult(null);
      setErrorMessage('Error analyzing ticket');
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Customer Service Dashboard</h2>

      {/* Dropdown to select between "Submit a Ticket" and "Analyze a Ticket" */}
      <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
        <option value="submit">Submit a Ticket</option>
        <option value="analyze">Analyze a Ticket</option>
      </select>

      {/* Submit a Ticket Form */}
      {selectedOption === 'submit' && (
        <div>
          <h3>Submit a Ticket</h3>
          <form onSubmit={handleSubmitTicket}>
            {/* Ticket Number Field */}
            <label>
              Ticket Number: {ticketNumber || 'Generating automatically after submission'}
            </label>
            <br />
            <label>
              Description:
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                required
              />
            </label>
            <br />
            <label>
              Upload Image:
              <input type="file" onChange={handleImageChange} />
            </label>
            <br />
            <button type="submit">Submit Ticket</button>
          </form>
          {responseMessage && <p>{responseMessage}</p>}
          {ticketNumber && <p>Your Ticket Number: {ticketNumber}</p>} {/* Display generated ticket number */}
        </div>
      )}

      {/* Analyze a Ticket Form */}
      {selectedOption === 'analyze' && (
        <div>
          <h3>Analyze a Ticket</h3>
          <input
            type="text"
            value={ticketNumber}
            onChange={handleTicketNumberChange}
            placeholder="Enter ticket number"
            required
          />
          <button onClick={handleAnalyzeTicket}>Analyze Ticket</button>
          {analysisResult && (
            <div>
              <h4>Analysis Result:</h4>
              <p>{analysisResult}</p>
            </div>
          )}
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
      )}
    </div>
  );
}

export default CustomerService;
