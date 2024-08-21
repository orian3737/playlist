// dont forget within the try catch when catching an error
//  make sure to clear the session storage of access token because its likely their token has simply expired.
//used for displaying a users playlists and the cover image
//using .user_playlists 

import React, { useState, useEffect } from 'react';
import { Card } from "flowbite-react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Playlists = ({ accessToken }) => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch playlists');
        }
        
        const data = await response.json();
        console.log(data.items)
        const playlistArray = data.items.map((playlist) => 
            {           
            console.log(playlist) 
            return {
           name: playlist.name,
           creator: (playlist.owner.display_name? playlist.owner.display_name : 'unknown' ),
           tracksCount: (playlist.tracks.total? playlist.tracks.total : 'unknown'),
          id: playlist?.id // Keep the id for routing
        }});
        console.log(playlistArray)

        setPlaylists(playlistArray);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPlaylists();
  }, []);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid-cols-1 justify-center justify-items-center justify-self-center content-cen gap-4">
      {playlists.map((playlist) => (
        <Card 
          key={playlist.id} 
          className="max-w-sm" 
          horizontal
        >
          <h5 className="text-2xl font-bold tracking-tight text-gray-100 dark:text-white">
            {playlist.name}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Created by: {playlist.creator}
          </p>
          <small className="font-normal text-gray-600">
            {playlist.tracksCount} Tracks
          </small>
          <Link to={`/tracks/${playlist.id}`} className="mt-4 inline-flex items-center text-spotifygreen hover:underline">
            Go to Playlist <FaArrowRight className="ml-2" />
          </Link>
        </Card>
      ))}
    </div>
  );
};

export default Playlists;
