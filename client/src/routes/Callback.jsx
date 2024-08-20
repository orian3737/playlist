import { useEffect, useState } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';

const Callback = () =>{
  
  
  const location = useLocation();
  const [code, setCode] = useState(null);
  const searchParams = new URLSearchParams(location.search);
  const codeParam = searchParams.get('code');
  const navigate = useNavigate();
    const handleCallback = async (code) => {
        try {
          const response = await fetch('http://localhost:5000/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({code: code}),
          });
      
          if (!response.ok) {
            throw new Error('Authorization failed');
          }
      
          const data = await response.json();
      
          // Now you have the access token from the response
          console.log('Auth token received:', data);
      
          // Optionally store the token in sessionStorage
          sessionStorage.setItem('spotify_access_token', data);
          navigate('/Home/dash')
      
        } catch (error) {
          console.error('Error during callback:', error.message);
        }
      };
      

  useEffect(() => {
    // Extract the code from the URL

    if (codeParam) {
      setCode(codeParam);
      console.log('Authorization Code:', codeParam);
      handleCallback(codeParam)

      // You can now send this code to the backend, or do further processing
    }
  }, []);

    return(
        <div>
        <h1>working</h1>
        </div>
    )
}
export default Callback