import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MedicineDetail = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const response = await axios.get(`http://localhost:3006/api/medicines/${id}`);
        setMedicine(response.data);
      } catch (error) {
        console.error('Error fetching medicine:', error);
      }
    };
  
    fetchMedicine();
  }, [id]);

  if (!medicine) return <div>Loading...</div>;

  return (
    <div className="medicine-detail">
      <h1>{medicine.medicine_name}</h1>
      <p>Price: ${medicine.price}</p>
      <p>Description: {medicine.description}</p>
      <p>Dosage: {medicine.dosage}</p>
      <ul>
        Side Effects:
        {medicine.side_effects.map((effect, index) => (
          <li key={index}>{effect}</li>
        ))}
      </ul>
    </div>
  );
};

export default MedicineDetail;