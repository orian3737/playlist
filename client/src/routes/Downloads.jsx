import React, { useState, useEffect } from 'react';
import { Card, Button } from "flowbite-react"; // Replace with your actual Card component import


function Downloads() {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/downloads', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setDownloads(data.downloads);
        } else {
          const data = await response.json();
          alert(`Failed to fetch downloads: ${data.error}`);
        }
      } catch (error) {
        alert(`An error occurred: ${error.message}`);
      }
    };

    fetchDownloads();
  }, []);

  return (
    <div className="bg-fixed flex justify-center bg-music-city-3 bg-auto bg-center h-fit" >
      <h2 classNmae='text-3xl font-bold '>Your Downloads</h2>
      <Card className="my-4 rounded-lg  shadow-lg shadow-spotify border-spotify grid-cols-1 h-fit max-w-lg p-6 text-white" style={{ backgroundColor: '#272323' }}>

      <ul className="mt-4">
        { downloads.length>1? (
          downloads?.map((download, index) => (
            <li key={index}>
              <strong>{download.name}</strong> by {download.artist} - {download.date}
            </li>
          )
        )):(
            <h1>no Downloads yet</h1>

        )
    }
      </ul>
      </Card>
    </div>
  );
}

export default Downloads;