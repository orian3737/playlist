import React, { useEffect, useState } from 'react';
import SpotifyConnect from '../components/SpotifyConnect';

const Home = () => {
  // const [playlists, setPlaylists] = useState([]);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchPlaylists = async () => {
  //     try {
  //       const response = await fetch('/playlists');
  //       if (response.ok) {
  //         const data = await response.json();
  //         setPlaylists(data);
  //       } else {
  //         setError('Failed to fetch playlists');
  //       }
  //     } catch (err) {
  //       setError('An error occurred while fetching playlists');
  //       console.error(err);
  //     }
  //   };

  //   fetchPlaylists();
  // }, []);

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

console.log("rendering page")
const [validToken, setValidToken] = useState('')
useEffect(() => {
  const getSpotifyToken = async () => {
    try {
      // Check if token exists in session storage
      const storedToken = sessionStorage.getItem('spotify_access_token');
      
      if (storedToken) {
        // If token exists in session storage, set it in the state
        setValidToken(storedToken);
      } else {
        // If token doesn't exist, call the backend to check if the user is connected
        const response = await fetch('http://localhost:5000/check_token', {
          method: 'GET',
          credentials: 'include',  // Ensure that cookies are sent for session handling
        });

        if (response.ok) {
          const data = await response.json();
          if (data.access_token) {
            // If we get a valid access token from the backend, store it in sessionStorage and update the state
            sessionStorage.setItem('spotify_access_token', data.access_token);
            setValidToken(data.access_token);
          }
        } else {
          // If the response is not OK, clear the token and handle accordingly
          console.error("Failed to connect to Spotify or no valid token found.");
        }
      }
    } catch (error) {
      // Handle any errors that occur during the fetch request
      console.error("Error checking Spotify connection:", error);
    }
  };

  getSpotifyToken();
}, []);
  return (
    <div>
    {validToken ===''?(

      <SpotifyConnect />
    ):(
      <div>
       <h2>Your Playlists</h2>
       <p>validToken</p>
       </div>
      // <ul>
      //   {playlists.map((playlist, index) => (
      //     <li key={index}>
      //       <h3>{playlist.name}</h3>
      //       <p>{playlist.description}</p>
      //       <p>Owner: {playlist.owner}</p>
      //       <ul>
      //         {playlist.tracks.map((track, idx) => (
      //           <li key={idx}>
      //             {track.name} by {track.artists.join(', ')} - <a href={track.external_url} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
      //           </li>
      //         ))}
      //       </ul>
      //     </li>
      //   ))}
      // </ul>
      )}
    </div>
  );
};

export default Home;
