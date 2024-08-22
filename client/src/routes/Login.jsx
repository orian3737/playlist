import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import './Login.css';  
import { useUserContext } from '../components/UserContext';

const Login = () => {
  console.log("Login component rendered");

  const [error, setError] = useState(null);
  const [userExists, setUserExists] = useState(null);
  const [form, setForm] = useState(true);
  const navigate = useNavigate();
 // const [backgroundImage, setBackgroundImage] = useState('');

    const images = [
      '/images/MusicCity3.webp',
      '/images/MusicCity4.webp',
      '/images/MusicCity5.webp',
      '/images/MusicCity6.webp'
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    
  
    // Set a random background image

  return (
    <div className='bg-fixed flex flex-col justify-items-center items-center bg-music-city-1 bg-auto bg-center h-dvh'>
      <h1 className={`text-3xl  center justify-center mt-40 mb-${form? '24': '0'}`} >Hello, Welcome to Spotify Playlister</h1>
      
      {form ? ( 
        <LoginForm setForm={setForm} />
      ) : (
        <SignupForm setForm={setForm}/>
      )}
     
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default Login;
