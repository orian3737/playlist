import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from "flowbite-react"; // Replace with your actual Card component import

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
        setTracks(data);
      });
  }, [id, accessToken]);

  if (!tracks) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center">
      <Card className="max-w-lg p-6 text-white" style={{ backgroundColor: '#272323' }}>

        <h5 className="text-3xl font-bold tracking-tight mb-4">
          {tracks.name}
        </h5>
        <p className="font-normal text-gray-400">
          Created by: {tracks.owner?.display_name || "Unknown"}
        </p>
        <small className="font-normal text-gray-500">
          {tracks.tracks?.total || 0} Tracks
        </small>
        <div className="mt-4">
          {tracks.tracks?.items?.map((track, index) => (
            <div key={`${track.id}-${index}`} className="mb-4 flex items-center">
              <img
                src={track.track.album.images[0]?.url}
                alt={track.track.name}
                className="w-16 h-16 mr-4"
              />
              <div>
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
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Tracks;
