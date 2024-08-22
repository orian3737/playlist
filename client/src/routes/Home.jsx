import React, { useEffect, useState } from 'react';
import SpotifyConnect from '../components/SpotifyConnect';
import './Home.css';
import Playlists from '../components/Playlists'
import DisconnectSpotify  from '../components/DisconnectSpotify'

const Home = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [validToken, setValidToken] = useState(false);
  
 
  //const [backgroundImage, setBackgroundImage] = useState('');
  

  // const images = ['/images/MusicCity3.webp',
  //   '/images/MusicCity4.webp',
  //   '/images/MusicCity5.webp',
  //   '/images/MusicCity6.webp'];
  // const randomImage = images[Math.floor(Math.random() * images.length)];

  useEffect(() => {
   
    const storedToken = sessionStorage.getItem('spotify_access_token')

    // Fetch Spotify access token
    const getSpotifyToken = async () => {
      if (storedToken) {
        setValidToken(true);
      } else {
        try {
          const response = await fetch('http://127.0.0.1:5000/check_token', {
            method: 'PATCH', credentials: 'include'
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
  }, [])

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
    
    <div className={validToken? ('bg-fixed flex justify-center bg-music-city-5 bg-auto bg-center h-fit'):('bg-fixed flex justify-center justify-items-center items-center bg-music-city-3 bg-auto bg-center h-dvh')}>
      {validToken? (
        <div className="playlist-card">
          <h1 className="text-3xl text-spotifygreen" style={{ textAlign: 'center', fontWeight: '900',}}>Your Playlists</h1>
          <div className="playlist-window">
            <Playlists />
          </div>
        <div className='fixed bottom-0 right-0 bg-red-900 rounded-md mb-2'>
        <DisconnectSpotify setValidToken={setValidToken}/>
        </div>
        </div>
      ) : (
      
        <SpotifyConnect />
       
      )}
    
   
    </div>
  );
};

export default Home;
