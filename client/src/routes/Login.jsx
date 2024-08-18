import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
// import './Login.css';  // Uncomment this if you have a CSS file for styling

const Login = () => {
  console.log("Login component rendered");
  
  const [error, setError] = useState(null);
  const [userExists, setUserExists] = useState(null);
  const navigate = useNavigate();

  const handleCheckUser = async (email) => {
    try {
      const response = await fetch('/check_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error('Failed to check user');
      }
      const data = await response.json();
      setUserExists(data.exists);
    } catch (error) {
      setError('Failed to check user');
      console.error('Error checking user:', error);
    }
  };

  const handleSpotifyLogin = () => {
    const clientId = 'YOUR_SPOTIFY_CLIENT_ID';
    const redirectUri = 'YOUR_REDIRECT_URI';
    const scopes = 'playlist-read-private playlist-read-collaborative';
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
      localStorage.setItem('spotifyAccessToken', accessToken);
      navigate('/home');
    } else if (hash.includes('error')) {
      setError('Spotify authentication failed.');
      console.error('Spotify authentication error:', params.get('error'));
    }
  }, [navigate]);

  const handleSubmit = (email) => {
    handleCheckUser(email);
  };

  return (
    <div>
      <h1>Hello, Welcome to Spotify Playlister</h1>
      {userExists === null ? (
        <LoginForm onSubmit={handleSubmit} />
      ) : userExists ? (
        <LoginForm />
      ) : (
        <SignupForm />
      )}
      <button className="spotify-button" onClick={handleSpotifyLogin}>
        Login with Spotify
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default Login;
