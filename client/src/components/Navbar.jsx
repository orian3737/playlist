import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav>
    <Link to="/">Home</Link>
    <Link to="/playlists">Playlists</Link>
    <a href={import.meta.env.VITE_SPOTIFY_REDIRECT}>Connect to Spotify</a>
  </nav>
);

export default Navbar;
