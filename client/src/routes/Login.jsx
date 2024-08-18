import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
// import './Login.css';  // Uncomment this if you have a CSS file for styling
import { useUserContext } from '../components/UserContext';

const Login = () => {
  console.log("Login component rendered");
  
  const [error, setError] = useState(null);
  const [userExists, setUserExists] = useState(null);
  const [form, setForm] = useState(true)
  const navigate = useNavigate();
  const { userData, setUserData } = useUserContext();


  return (
    <div>
      <h1>Hello, Welcome to Spotify Playlister</h1>
      
      {form? ( 
        <LoginForm setUserData={setUserData} setForm={setForm} />
      ) : (
        <SignupForm setUserData={setUserData} setForm={setForm}/>
      )}
     
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default Login;
