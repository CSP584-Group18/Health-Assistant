import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/MedicineCard.css";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
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

  return (
    <div className="medicine-dashboard">
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
    </div>
  );
};

export default Dashboard;
