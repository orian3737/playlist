import React, { useState, useEffect } from 'react';
import { Card } from "flowbite-react";
import { FaArrowRight, FaDownload } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Playlists = ({ accessToken }) => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }
        
        const data = await response.json();
        setPlaylists(data.items.map((playlist) => ({
          name: playlist.name,
          creator: playlist.owner.display_name || 'Unknown',
          tracksCount: playlist.tracks.total,
          id: playlist.id,
          imageUrl: playlist.images[0]?.url || ''
        })));
      } catch (err) {
        setError(err.message);
        sessionStorage.removeItem('spotify_access_token'); // Likely expired token
      }
    };

    fetchPlaylists();
  }, [accessToken]);

  const downloadPlaylist = async (playlistId) => {
    const config = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlist_id: playlistId }),
        credentials: 'include'  // Ensure cookies are included with the request
    };

    fetch('http://localhost:5000/download/playlist', config)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log(data);
            alert('Playlist downloaded successfully!');
        })
        .catch(err => {
            console.error('Error downloading playlist:', err.message);
            alert('Error downloading playlist: ' + err.message);
        });
};
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {playlists.map((playlist) => (
        <Card key={playlist.id} className="max-w-sm" horizontal>
         
         <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-48 object-cover" />
          <div>
            <h5 className="text-2xl font-bold tracking-tight text-gray-100 dark:text-white">
              {playlist.name}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              Created by: {playlist.creator}
            </p>
            <small className="font-normal text-gray-600">
              {playlist.tracksCount} Tracks
            </small>
            <div className="flex items-center mt-4">
              <Link to={`/tracks/${playlist.id}`} className="inline-flex items-center text-spotifygreen hover:underline">
                Go to Playlist <FaArrowRight className="ml-2" />
              </Link>
              <button onClick={() => downloadPlaylist(playlist.id)} className="ml-4 inline-flex items-center  hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Download <FaDownload className="ml-2" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Playlists;
