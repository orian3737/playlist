import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button } from "flowbite-react"; // Replace with your actual Card component import
import { FaArrowLeft, FaDownload } from "react-icons/fa";


function Tracks() {
  let { id } = useParams(); 
  const accessToken = sessionStorage.getItem('spotify_access_token');
  const [tracks, setTracks] = useState(null);

  useEffect(() => {
    const config = {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    };
    fetch(`https://api.spotify.com/v1/playlists/${id}`, config)
      .then(res => res.json())
      .then(data => {
        console.log(data);
         doTheThing(data)
        setTracks(data);
      })
      
  }, [id]);

  
    const handleDownload = async (trackId) => {
      console.log(trackId)
      try {
        const response = await fetch('http://127.0.0.1:5000/downloads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ track_id: trackId }),
          credentials: 'include',
        });
  
        if (response.ok) {
          alert('Download added successfully');
        } else {
          const data = await response.json();
          alert(`Failed to add download: ${data.error}`);
        }
      } catch (error) {
        alert(`An error occurred: ${error.message}`);
      }
    };

    async function doTheThing(tracks){
      if(tracks){
    const tracksToSend = tracks&&tracks.tracks.items?.map((track)=>{ return(
      {
        name : track.track.name,
        artist: track.track.artists.map(artist => artist.name).join(', '),
        song_id: track.track.id,
      })})

    try {
      const response = await fetch('http://127.0.0.1:5000/save_tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({songs: tracksToSend}),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message || 'Tracks saved successfully!');
      } else {
        const errorData = await response.json();
       consol.error(errorData.error || 'Failed to save tracks.');
      }
    } catch (error) {
      console.error('Error: Unable to reach the server.');
    }}
  }

  
  

  // const downloadPlaylist = async () => {
  //   const config = {
  //       method: 'POST',
  //       headers: {
  //           'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({s}),
  //       credentials: 'include'  // Ensure cookies are included with the request
  //   };

    

  return (
    <div className="bg-fixed flex justify-center bg-music-city-3 bg-auto bg-center h-fit" >
        <Link className='fixed top-1/8 left-3' to="/Home/dash" >
        <Button className="inline-flex items-center text-spotifygreen bg-spotifydarkgray hover:underline bgspotifygreen shadow-inner">   
           <FaArrowLeft className="mr-2" /> Go to Home
        </Button>
        </Link>
      <Card className="my-4 rounded-lg  shadow-lg shadow-spotify border-spotify grid-cols-1 h-fit max-w-lg p-6 text-white" style={{ backgroundColor: '#272323' }}>
              
        <h5 className="text-3xl font-bold tracking-tight mb-4">
          {tracks?.name}
        </h5> 
        
        <h5 className="text-spotifygreen">Your Spotify Tracks</h5>
        <p className="font-normal text-gray-400">
          Created by: {tracks?.owner?.display_name || "Unknown"}
        </p>
        <small className="font-normal text-gray-500">
          {tracks?.tracks?.total || 0} Tracks
        </small>
        <div className="mt-4">
          {tracks?.tracks?.items?.map((track, index) => (
            <div key={`${track.id}-${index}`} className="mb-4 flex flex-row items-center ">
              <img
                src={track.track.album.images[0]?.url}
                alt={track.track.name}
                className="w-16 h-16 mr-4"
              />
              <div className='mr-2'>
                <h6 className="text-lg font-bold">
                  {track.track.name}
                </h6>
                <p className="text-gray-400">
                  Artist: {track.track.artists.map(artist => artist.name).join(', ')}
                </p>
                <p className="text-gray-400">
                  Album: {track.track.album.name}
                </p>
              </div>
              <button onClick={() => handleDownload(track.track.id)} >
                <FaDownload  />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Tracks;
