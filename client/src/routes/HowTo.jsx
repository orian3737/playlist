import React from 'react';
import useRandomBackground from '../components/RandomBackroundGen.js';  // Ensure the file name is spelled correctly

function HowTo() {
  const backgroundImage = useRandomBackground();  // Move the hook call inside the component

  return (
    <div style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      height: '100vh', // You might want to set a height to ensure the background covers the desired area
      width: '100vw'  // Ensure the width covers the viewport width
    }}>
      <div style={{ color: 'white', fontSize: '24px' }}>How To</div>
    </div>
  );
}

export default HowTo;
