import React, { useEffect, useState } from 'react';
import SpotifyConnect from '../components/SpotifyConnect';

const Home = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/playlists');
        if (response.ok) {
          const data = await response.json();
          setPlaylists(data);
        } else {
          setError('Failed to fetch playlists');
        }
      } catch (err) {
        setError('An error occurred while fetching playlists');
        console.error(err);
      }
    };

    fetchPlaylists();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <SpotifyConnect />
      <h2>Your Playlists</h2>
      <ul>
        {playlists.map((playlist, index) => (
          <li key={index}>
            <h3>{playlist.name}</h3>
            <p>{playlist.description}</p>
            <p>Owner: {playlist.owner}</p>
            <ul>
              {playlist.tracks.map((track, idx) => (
                <li key={idx}>
                  {track.name} by {track.artists.join(', ')} - <a href={track.external_url} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
