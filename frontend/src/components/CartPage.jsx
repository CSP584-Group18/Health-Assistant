// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./CSS/CartPage.css";
// import { useNavigate } from "react-router-dom";

// const CartPage = () => {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const baseURL = process.env.REACT_APP_API_BASE_URL;
//   const navigate = useNavigate();
//   useEffect(() => {
//     const fetchCartItems = async () => {
//       const email = localStorage.getItem("email");

//       if (!email) {
//         setError("User email not found. Please log in.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get(`${baseURL}/cart`, {
//           params: { email },
//         });
//         setCartItems(response.data);
//       } catch (err) {
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCartItems();
//   }, []);


//   const handleCheckOut = () => {
//     const cartData = {
//       items: cartItems,
//       totalAmount: calculateTotalAmount(),
//     };
//     navigate("/checkout", { state: cartData });
//   }
//   const calculateTotalAmount = () => {
//     return cartItems.reduce((acc, item) => acc + item.totalAmount, 0).toFixed(2);
//   };

//   const handleCancelOrder = async (itemId) => {
//     try {
//       await axios.delete(`${baseURL}/cart/${itemId}`);
//       // Update the state to remove the deleted item from the UI
//       setCartItems(cartItems.filter(item => item._id !== itemId));
//     } catch (err) {
//       console.error("Failed to delete cart item", err);
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <>
//       <div className="cart-page">
//         {cartItems.length === 0 ? (
//           <p>Your cart is empty.</p>
//         ) : (
//         <table className="order-table">
//           <thead>
//             <tr>
//               <th>Medicine Name</th>
//               <th>Quantity</th>
//               <th>Total Price</th>
//               <th>Cancel Order</th>
//             </tr>
//           </thead>
//           <tbody className="cart-items-list">
//           {cartItems.map((item) => (
//               <tr key={item._id} className="cart-item">
//                 <td>{item.medicineName}</td>
//                 <td>{item.quantity}</td>
//                 <td>${item.totalAmount.toFixed(2)}</td>
//                 <td>
//                   <button className="cancel-button" onClick={() => handleCancelOrder(item._id)}>Cancel</button>
//                </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//         <div className="check">
//         <div className="total-amount">
//           Total Amount: ${calculateTotalAmount()}
//         </div>

//         <button onClick={handleCheckOut} className="proceed-checkout">Proceed to Checkout</button>
//       </div>
//       </div>
//     </>
//   );
// };

// export default CartPage;




import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CSS/CartPage.css";
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      const email = localStorage.getItem("email");

      if (!email) {
        setError("User email not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseURL}/cart`, {
          params: { email },
        });
        setCartItems(response.data);
      } catch (err) {
        console.error("Error fetching cart items:", err); // Log the full error object
        // setError("Your Cart is empty. Please buy product");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [baseURL]);

  const handleCheckOut = () => {
    const cartData = {
      items: cartItems,
      totalAmount: calculateTotalAmount(),
    };
    navigate("/checkout", { state: cartData });
  };

  const calculateTotalAmount = () => {
    return cartItems
      .reduce((acc, item) => acc + item.totalAmount, 0)
      .toFixed(2);
  };

  const handleCancelOrder = async (itemId) => {
    try {
      await axios.delete(`${baseURL}/cart/${itemId}`);
      // Update the state to remove the deleted item from the UI
      setCartItems(cartItems.filter((item) => item._id !== itemId));
    } catch (err) {
      console.error("Failed to delete cart item", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>; // No "Error" word here

  return (
    <>
      <Navbar/>
      <div className="cart-page">
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                  <th>Cancel Order</th>
                </tr>
              </thead>
              <tbody className="cart-items-list">
                {cartItems.map((item) => (
                  <tr key={item._id} className="cart-item">
                    <td>{item.medicineName}</td>
                    <td>{item.quantity}</td>
                    <td>${item.totalAmount.toFixed(2)}</td>
                    <td>
                      <button
                        className="cancel-button"
                        onClick={() => handleCancelOrder(item._id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="check">
              <div className="total-amount">
                Total Amount: ${calculateTotalAmount()}
              </div>

              <button onClick={handleCheckOut} className="proceed-checkout">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartPage;
