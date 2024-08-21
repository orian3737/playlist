// hooks/useRandomBackground.js
const useRandomBackground = () => {
    const images = [
      '/images/MusicCity.webp',
      '/images/MusicCity2.webp',
      '/images/MusicCity3.webp',
      '/images/MusicCity4.webp',
      '/images/MusicCity5.webp',
      '/images/MusicCity6.webp'
    ];
  
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return randomImage;
  };
  
  export default useRandomBackground;
  