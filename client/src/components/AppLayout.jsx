import { UserContext } from './UserContext';
import { Outlet, useLoaderData, useNavigate  } from 'react-router-dom';
import Navbar from './Navbar';
import { useEffect, useState } from 'react';

const AppLayout = () => { 
  const navigate = useNavigate();
  const data = useLoaderData();
  
  const [userData, setUserData] = useState(data);

  useEffect(() => {
    if (!userData) {
      navigate('/'); // Redirect to login if there is no user data
    }
  }, [userData, navigate]);




  return (
    <UserContext.Provider value={{userData, setUserData}}>
      <Navbar />
      <Outlet  />
    </UserContext.Provider>
  );
};

export default AppLayout;