import React from 'react';
import { Accordion } from "flowbite-react";
import useRandomBackground from '../components/RandomBackroundGen.js'; // Ensure the file name is spelled correctly

function HowTo() {
  const backgroundImage = useRandomBackground();  // Move the hook call inside the component

  return (
    <div style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      height: '100vh'
    }} className="flex justify-center items-center">
      <div style={{ 
        maxWidth: '90%', 
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // slightly less opaque for better text readability
        padding: '20px', 
        borderRadius: '12px', // slightly increased for a more rounded appearance
        color: '#f8f9fa' // a light color for text
      }}>
        <Accordion flush={false}>
          <Accordion.Panel>
            <Accordion.Title>Understanding OAuth2.0</Accordion.Title>
            <Accordion.Content>
              <p className="mb-2">
                OAuth2.0 is an industry-standard protocol for authorization, providing a secure way for applications to request access to resources on behalf of the user without exposing user credentials.
              </p>
              <p className="mb-2">
                The process involves user authorization, authorization code grant, and access token exchange. This framework acts as an intermediary for secure API interactions, like those necessary for connecting with Spotify.
              </p>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>Challenges of Connecting to Spotify</Accordion.Title>
            <Accordion.Content>
              <p className="mb-2">
                Implementing Spotify’s OAuth2.0 presented challenges such as understanding the authorization flow, managing token lifecycle, and handling API rate limits.
              </p>
              <p className="mb-2">
                These steps require in-depth understanding of OAuth2.0 and a robust handling mechanism for tokens and API limits to ensure a smooth user experience.
              </p>
            </Accordion.Content>
          </Accordion.Panel>
          <Accordion.Panel>
            <Accordion.Title>Real-World Implementation Tips</Accordion.Title>
            <Accordion.Content>
              <p className="mb-2">
                It's crucial to have detailed error handling, token refresh strategies, and rate limit management to optimize the integration with Spotify's API and maintain application performance.
              </p>
              <p className="mb-2">
                Practical experience and testing are key to overcoming these challenges and achieving a seamless authorization flow.
              </p>
            </Accordion.Content>
          </Accordion.Panel>
        </Accordion>
      </div>
    </div>
  );
}

export default HowTo;
