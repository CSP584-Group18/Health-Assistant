import React, { useState } from "react";
import axios from "axios";
import "./CSS/CustomerService.css";
import Navbar from "./Navbar";

function CustomerService() {
  const [selectedOption, setSelectedOption] = useState("submit");
  const [ticketNumber, setTicketNumber] = useState("");
  const [description, setDescription] = useState("");
  const [ticketImage, setTicketImage] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const handleTicketNumberChange = (e) => {
    setTicketNumber(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleImageChange = (e) => {
    setTicketImage(e.target.files[0]);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("description", description);
    formData.append("ticketImage", ticketImage);

    try {
      const response = await axios.post(`${baseURL}/tickets`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTicketNumber(response.data.ticketNumber);
      setResponseMessage(response.data.message);
    } catch (error) {
      setResponseMessage("Error submitting ticket");
      console.error(error);
    }
  };

  const handleAnalyzeTicket = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/tickets/analyze/${ticketNumber}`
      );
      setAnalysisResult(response.data.decision);
      setErrorMessage("");
    } catch (error) {
      setAnalysisResult(null);
      setErrorMessage("Error analyzing ticket");
      console.error(error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="customer-service">
        <h2 className="customer-service__title">Customer Service Dashboard</h2>

        <select
          className="customer-service__dropdown"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="submit">Submit a Ticket</option>
          <option value="analyze">Analyze a Ticket</option>
        </select>

        {selectedOption === "submit" && (
          <div className="customer-service__submit-section">
            <h3 className="customer-service__subtitle">Submit a Ticket</h3>
            <form
              className="customer-service__form"
              onSubmit={handleSubmitTicket}
            >
              <label className="customer-service__label">
                Ticket Number:{" "}
                {ticketNumber || "Generating automatically after submission"}
              </label>
              <textarea
                className="customer-service__textarea"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Describe your issue"
                required
              />
              <input
                type="file"
                className="customer-service__file-input"
                onChange={handleImageChange}
              />
              <button type="submit" className="customer-service__submit-button">
                Submit Ticket
              </button>
            </form>
            {responseMessage && (
              <p className="customer-service__response">{responseMessage}</p>
            )}
            {ticketNumber && (
              <p className="customer-service__ticket-number">
                Your Ticket Number: {ticketNumber}
              </p>
            )}
          </div>
        )}

        {selectedOption === "analyze" && (
          <div className="customer-service__analyze-section">
            <h3 className="customer-service__subtitle">Analyze a Ticket</h3>
            <input
              type="text"
              className="customer-service__input"
              value={ticketNumber}
              onChange={handleTicketNumberChange}
              placeholder="Enter ticket number"
              required
            />
            <button
              className="customer-service__analyze-button"
              onClick={handleAnalyzeTicket}
            >
              Analyze Ticket
            </button>
            {analysisResult && (
              <div className="customer-service__analysis-result">
                <h4>Analysis Result:</h4>
                <p>{analysisResult}</p>
              </div>
            )}
            {errorMessage && (
              <p className="customer-service__error-message">{errorMessage}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default CustomerService;
