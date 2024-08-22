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
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    // Set a random background image
    const images = [
      '/images/MusicCity3.webp',
      '/images/MusicCity4.webp',
      '/images/MusicCity5.webp',
      '/images/MusicCity6.webp'
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBackgroundImage(randomImage);
  }, []);

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', height: '100vh' }}>
      <h1>Hello, Welcome to Spotify Playlister</h1>
      
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
