
import { useState } from 'react';

import { HiInformationCircle } from "react-icons/hi";
import { Alert, Button } from "flowbite-react";

function DisconnectSpotify() {


  const [message, setMessage] = useState(null);

  const handleRemoveConnection = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/remove_connection', {
        method: 'DELETE',
        credentials: 'include', // include session credentials in the request
      });

      if (response.ok) {
        setMessage({
            message:' Spotify Connection Removed Successfully.',
            isError: false,
            });
        sessionStorage.removeItem('spotify_access_token')    
      } else  {
        const data = await response.json();
        setMessage(
            {
            message: data['message'],
            isError: true,
            }
        );
      }
    } catch (error) {
      setMessage({
            message: `${error.message}`,
            isError: true,
            },
    )}
  };

  return (
    <div>
      <Button color="red" onClick={()=>handleRemoveConnection()} >
        Remove Spotify Connection
      </Button>
      {message && (
        <Alert color={message.isError? 'failure':'success'} icon={HiInformationCircle}><span className="font-medium">Info alert!</span> {message.message}</Alert>
      )
      }
    </div>
  )

}

export default DisconnectSpotify
