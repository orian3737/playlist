import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm'

// Function to handle Spotify login
const handleSpotifyLogin = () => {
  // Replace with your Spotify client ID and redirect URI
  const clientId = 'YOUR_SPOTIFY_CLIENT_ID';
  const redirectUri = 'YOUR_REDIRECT_URI';
  const scopes = 'playlist-read-private playlist-read-collaborative';
  
  // Spotify authorization URL
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}`;

  // Redirect user to Spotify login
  window.location.href = authUrl;
};

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Handle the OAuth redirect and token retrieval
  React.useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
      // Save token and fetch playlists
      localStorage.setItem('spotifyAccessToken', accessToken);
      fetchPlaylists(accessToken);
    } else if (hash.includes('error')) {
      setError('Spotify authentication failed.');
    }
  }, []);

  const fetchPlaylists = async (accessToken) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const data = await response.json();
      // Process playlists (e.g., save to state, display, etc.)
      console.log(data);

      // Navigate to the next page or handle playlist data
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Hello, Welcome to Spotify Playlister</h1>
      <button onClick={handleSpotifyLogin}>Login with Spotify</button>
      {error && <p>Error: {error}</p>}
      <LoginForm/>
    </div>
  );
};

export default Login;

/* sign up will have a sign up form to add them to the database and then run the handleSpotifyLogin function upon authentication
they will then be redirected to the home page
login will have authenication and then full spotify credentials -> load into session storage? and re route to home
*/