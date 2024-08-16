import React from 'react';

const Playlists = ({ playlists, loading }) => (
  <div>
    <h1>Your Playlists</h1>
    {loading ? (
      <p>Loading...</p>
    ) : (
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.id}>
            {playlist.name} - <a href={playlist.external_urls.spotify}>Spotify Link</a>
            <button onClick={() => handleDownload(playlist.id)}>Download</button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const handleDownload = (playlistId) => {
  console.log(`Download playlist ${playlistId}`);
  // Implement the logic to download the playlist from YouTube using youtube_dl
};

export default Playlists;
