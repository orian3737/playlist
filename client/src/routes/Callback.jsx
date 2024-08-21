import { useEffect, useState } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';

const Callback = () =>{
  
  
  const location = useLocation();
  const [code, setCode] = useState(null);
  const [token, setToken] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const codeParam = searchParams.get('code');
  const navigate = useNavigate();


   
      const client_secret = '6fff727342854ca0bfd31ad37cea2528';  // Replace with your Spotify Client Secret
     
      const client_id = '6714017dbb3a41fc8a032c80b26c0eba'; // Client ID is hard-coded here
      const redirect_uri = 'http://127.0.0.1:5173/Home/callback'; 

        useEffect(() => {
                
          if (codeParam) {
            setCode(codeParam);
            console.log('Authorization Code:', codeParam);
                // You can now send this code to the backend, or do further processing
          }
          if (code) {
            const getToken = async () => {
              const authOptions = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Authorization': 'Basic ' + btoa(`${client_id}:${client_secret}`)
                },
                body: new URLSearchParams({
                  code: code,
                  redirect_uri: redirect_uri,
                  grant_type: 'authorization_code'
                })
              };
      
              try {
                const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
                const data = await response.json();
                if (response.ok) {
                    
                  setToken({
                      access_token:data.access_token,
                      expires_in: data.expires_in,
                      refresh_token: data.refresh_token
                    })
                    
                   saveToken(data)
         
                    
                    console.log(data)
                    sessionStorage.setItem('spotify_access_token', data.a);
                    
                } else {
                  console.error('Error fetching token:', data);
                }
                
              } catch (error) {
                console.error('Error:', error);
              }
            };
      
            getToken();
           

          }
        }, [code, client_id, client_secret, redirect_uri]);
      
      
      const saveToken = async (token) => {
       
        console.log(token)
        
         console.log(token.access_token)
         console.log(token.refresh_token)
         console.log(token.expires_in)
        
          try {
          
            const response = await fetch('http://127.0.0.1:5000/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    expires_in: token.expires_in,
                  }),
                  credentials: 'include' ,
                })
                if (!response.ok) {
                    throw new Error('Authorization failed');
                  }
              
                  const data = await response.json();
              
                  // Now you have the access token from the response
                  console.log('Auth token received:', data);
                    // Optionally store the token in sessionStorage
              
                  navigate('/Home/dash')
              
                } catch (error) {
                    console.error('Error during callback:', error.message);
                  }
                };
                
      
            
                return (
        <div>
        <h1>working</h1>
        </div>
    )
}
export default Callback