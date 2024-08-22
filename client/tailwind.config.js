module.exports = {
  content: [
    "./src/**/*.{js,jsx}", // Include all JavaScript and JSX files in src directory
    "./public/index.html", // Include your HTML file
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
      }
      
    },
  },
  plugins: [
    require('flowbite/plugin') // Ensure the plugin is correctly required
  ],
};
