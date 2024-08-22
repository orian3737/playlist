module.exports = {
  content: [
    "./src/**/*.{js,jsx}", // Include all JavaScript and JSX files in src directory
    "./public/index.html",  // Include your HTML file
  ],
  theme: {
    extend: {
      colors: {
        spotify: '#1DB954', // Custom color name 'spotify'
        spotifygreen: '#1DB954',
        spotifyblack: '#191414',
        spotifydarkgray: '#272323',
        spotifylightgray: '#B3B3B3',
        spotifywhite: '#FFFFFF'
      },
      backgroundImage: {
        'music-city-1': "url('/images/MusicCity.webp')",
        'music-city-2': "url('/images/MusicCity2.webp')",
        'music-city-3': "url('/images/MusicCity3.webp')",
        'music-city-4': "url('/images/MusicCity4.webp')",
        'music-city-5': "url('/images/MusicCity5.webp')",
        'music-city-6': "url('/images/MusicCity6.webp')",
      },
      inset: {
        '1/8': '12.5dvh',  // for percentage based approach
      }
    },
  },
  plugins: [
    require('flowbite/plugin') // Ensure the plugin is correctly required
  ],
};
