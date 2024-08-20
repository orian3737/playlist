import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SpotifyConnect() { 
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSpotifyLogin = () => {
        const clientId = '6714017dbb3a41fc8a032c80b26c0eba'; //add correct name
        const redirectUri =  'http://127.0.0.1:5173/Home/callback' //import.meta.env.VITE_SPOTIFY_REDIRECT; //add correct name /Home/callback
        const scopes = 'playlist-read-private playlist-read-collaborative user-read-private user-read-email';
        
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
        window.location.href = authUrl;
      };
    
    
    return(
        <div>
        <button className="spotify-button" onClick={handleSpotifyLogin}>
        Login with Spotify
        </button>
        </div>
    )

}
export default SpotifyConnect;