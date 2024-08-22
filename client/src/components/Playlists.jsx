import React, { useState, useEffect } from 'react';
import { Card } from "flowbite-react";
import { FaArrowRight, FaDownload } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState('');
  const accessToken = sessionStorage.getItem('spotify_access_token')
  
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
              
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Playlists;
