import React from 'react'
import './CSS/Navbar.css'
// import cart_icon from '';
import { Link ,useNavigate} from 'react-router-dom';

const image = process.env.PUBLIC_URL;

const Navbar = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
      };

  return (
    <div className='navbar'>
        <div className="nav-logo">
            <p>Health Assistant</p>
        </div>
        <div className="nav-login-cart">
        <button onClick={handleLogout}>Logout</button>        
            <Link to='/cart'><img src={`${image}/Assets/Medicines/cart_icon.png`} alt="cart_icon" /></Link>
        </div>
    </div>
  )
}

export default Navbar