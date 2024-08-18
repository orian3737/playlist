import {useEffect} from react

const Callback = () =>{

    const handleCallback = async (code) => {
        try {
          const response = await fetch('http://localhost:5000/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });
      
          if (!response.ok) {
            throw new Error('Authorization failed');
          }
      
          const data = await response.json();
      
          // Now you have the access token from the response
          console.log('Auth token received:', data.auth);
      
          // Optionally store the token in sessionStorage
          sessionStorage.setItem('spotify_access_token', data.auth);
          navigate('/Home')
      
        } catch (error) {
          console.error('Error during callback:', error.message);
        }
      };
      


      useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        
        if (code) {
          handleCallback(code);  // Call the fetch function
        }
      }, []);

    return(
        <div>
        <h1>working</h1>
        </div>
    )
}
export default Callback