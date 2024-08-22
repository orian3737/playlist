import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'flowbite-react';

 

function SpotifyConnect() {
  const navigate = useNavigate();
  const handleSpotifyLogin = () => {
    const clientId = '6714017dbb3a41fc8a032c80b26c0eba'; // Client ID is hard-coded here
    const redirectUri = 'http://127.0.0.1:5173/Home/callback'; // Redirect URI is hard-coded here
    const scopes = 'playlist-read-private playlist-read-collaborative user-read-private user-read-email';
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  };

  return (
   
      <Card className=" login-card flex rounded-lg flex shadow-lg h-fit shadow-spotify border-spotify">
        <div className="flex flex-col items-center justify-center p-4">
          <Button
            onClick={handleSpotifyLogin} className="spotify-button ">
            Login with Spotify
          </Button>
        </div>
      </Card>

    
  );
}

export default SpotifyConnect;
