import React, { useEffect, useState } from 'react';
import SpotifyConnect from '../components/SpotifyConnect';
import './Home.css';
import Playlists from '../components/Playlists'

const Home = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [validToken, setValidToken] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  

  useEffect(() => {
    // Set a random background image
    const images = ['/images/MusicCity3.webp',
      '/images/MusicCity4.webp',
      '/images/MusicCity5.webp',
      '/images/MusicCity6.webp'];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBackgroundImage(randomImage);

    // Fetch Spotify access token
    const getSpotifyToken = async () => {
      const storedToken = sessionStorage.getItem('spotify_access_token');
      if (storedToken) {
        setValidToken(true);
      } else {
        try {
          const response = await fetch('http://127.0.0.1:5000/check_token', {
            method: 'GET', credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
              sessionStorage.setItem('spotify_access_token', data.access_token);
              setValidToken(true);
            }
          } else {
            console.error("Failed to connect to Spotify or no valid token found.");
          }
        } catch (error) {
          console.error("Error checking Spotify connection:", error);
        }
      }
    };
    getSpotifyToken();
  }, []);

  // useEffect(() => {
  //   // Fetch playlists if there's a valid token
  //   if (validToken) {
  //     const fetchPlaylists = async () => {
  //       try {
  //         const response = await fetch('/playlists', {
  //           headers: {
  //             Authorization: `Bearer ${validToken}` // Assuming your backend expects a Bearer token
  //           }
  //         });
  //         if (response.ok) {
  //           const data = await response.json();
  //           setPlaylists(data);
  //         } else {
  //           setError('Failed to fetch playlists');
  //         }
  //       } catch (err) {
  //         setError('An error occurred while fetching playlists');
  //         console.error(err);
  //       }
  //     };
  //     fetchPlaylists();
    // }
  // }, [validToken]); // Ensure this effect runs whenever `validToken` changes

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    
    <div style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>
      {validToken? (
        <div className="playlist-card">
          <h2 style={{ textAlign: 'center', fontWeight: 'bold', }}>Your Playlists</h2>
          <div className="playlist-window">
            <Playlists accessToken ={sessionStorage.getItem('spotify_access_token')} />
          </div>
        </div>
      ) : (
        <SpotifyConnect />
        
      )}
    </div>
  );
};

export default Home;
