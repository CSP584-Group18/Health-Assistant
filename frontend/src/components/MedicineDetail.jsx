import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CSS/MedicineDetail.css";
import Navbar from "./Navbar";
const baseURL = process.env.REACT_APP_API_BASE_URL;

const MedicineDetail = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const response = await axios.get(`${baseURL}/medicines/${id}`);
        setMedicine(response.data);
      } catch (error) {
        console.error("Error fetching medicine:", error);
      }
    };

    fetchMedicine();
  }, [id]);

  const handleAddToCart = async () => {
    const email = localStorage.getItem("email");
    if (!email) {
      console.error("User email not found in local storage.");
      return;
    }

    const totalAmount = medicine.price * quantity;

    try {
      await axios.post(`${baseURL}/cart`, {
        email,
        medicineName: medicine.medicine_name,
        totalAmount,
        quantity,
      });

      console.log(`Added ${quantity} of ${medicine.medicine_name} to cart.`);

      navigate("/cart");
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1));
  };

  if (!medicine) return <div>Loading...</div>;

  const totalAmount = medicine.price * quantity;

  return (
    <>
      <Navbar />
      <div className="medicine-detail">
        <h1>{medicine.medicine_name}</h1>
        <div className="info-section">
          <div className="info-row">
            <span className="info-label">Price:</span>
            <span className="info-value">${medicine.price}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Description:</span>
            <span className="info-value">{medicine.description}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Dosage:</span>
            <span className="info-value">{medicine.dosage}</span>
          </div>
        </div>

        <ul>
          Side Effects:
          {medicine.side_effects.map((effect, index) => (
            <li key={index}>{effect}</li>
          ))}
        </ul>

        <div className="quantity-selector">
          <label htmlFor="quantity">Quantity:</label>
          <button onClick={decrementQuantity}>-</button>
          <input
            type="number"
            id="quantity"
            min="1"
            value={quantity}
            readOnly
          />
          <button onClick={incrementQuantity}>+</button>
        </div>

        <div className="total-amount">
          <strong>Total Amount: </strong>${totalAmount.toFixed(2)}
        </div>
        <button className="add-to-cart" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </>
  );
};

export default MedicineDetail;
