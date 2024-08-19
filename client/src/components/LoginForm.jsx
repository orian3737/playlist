import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Label, TextInput } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUserContext } from '../components/UserContext';

function LoginForm({ setForm }) {
  const [eye, setEye] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const { userData, setUserData } = useUserContext();

  const handleSubmit = async () => {
    setIsLoading(true)
    const url = 'http://localhost:5000/login'
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({                                                                            
        username: values.username, 
        password: values.password
      }),
      credentials: 'include' 
    })
    .then(response => { if(response.ok){
      return response.json()
       
      } else{
        throw new Error("HTTP error " + response.status)
      }
    })
    .then((data)=>{
      console.log('sucess', data)
      setUserData(data)
      navigate('/Home/dash')
    })
    .catch((error) => {
      console.error('Login Error:', error);
      alert("Invalid Login Credentials")
      
    })
    .finally(() => {
      
      setIsLoading(false)
   
    });
  };



  return (
    <div className="login-form-container">
      <Card className="login-card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email1" value="Your username" />
            <TextInput id="email1" type="text" placeholder="username" required />
          </div>
          <div className="text-red-500">
  Don't have an account? <span onClick={()=>{setForm(false)}} >Sign up!</span>
</div>

          <div className="flex flex-row items-center">
            <TextInput id="password1" type={eye ? 'text' : 'password'} required />
            <button onClick={() => setEye(!eye)} type="button">
              {eye ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <Button className="login-button" type="submit">Submit</Button>
        </form>
      </Card>
    </div>
    
  );
}

export default LoginForm;
