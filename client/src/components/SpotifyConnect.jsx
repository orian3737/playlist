import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SpotifyConnect() { 
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSpotifyLogin = () => {
        const clientId = 'YOUR_SPOTIFY_CLIENT_ID';
        const redirectUri = 'YOUR_REDIRECT_URI';
        const scopes = 'playlist-read-private playlist-read-collaborative';
        
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}`;
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