import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from './UserContext';
function Logout() {
    const { userData, setUserData } = useUserContext();
    const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/logout', {
        method: 'DELETE',
        credentials: 'include', // This ensures cookies are sent with the request
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // "Logged out successfully"
        setUserData(null)
        sessionStorage.removeItem('spotify_access_token')
        navigate("/") // You can trigger additional logic here (e.g., redirect)
      } else {
        const errorData = await response.json();
        console.error(errorData.error); // Handle any error messages from the server
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="bg-gray-700 text-white p-1 rounded hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-600">
      Logout
    </button>
  );
}

export default Logout;