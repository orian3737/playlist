import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Label, TextInput } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUserContext } from '../components/UserContext';
import './LoginForm.css';
function LoginForm({ setForm }) {
  const [eye, setEye] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const { userData, setUserData } = useUserContext();
  const [values, setValues] = useState({
    username: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
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

  // fetch('http://localhost:5000/check_login_status', {         //Added Ryan
  //   credentials: 'include'  
  // })
  // .then(response => response.json())
  // .then(data => {
  //   if (data.logged_in) {
  //     console.log("User is logged in.");
  //   } else {
  //     console.log("User is not logged in.");
  //   }
  // })
  // .catch(error => console.error('Error checking login status:', error));  //login check
  


  return (
    <div className="login-form-container">
      <Card className="login-card">
        <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email1" value="Your username" />
            <TextInput name='username' value={values.username} onChange={handleChange} id="email1" type="text" placeholder="username" required />
          </div>
          <div className="text-red-500">
  Don't have an account? <span onClick={()=>{setForm(false)}} >Sign up!</span>
</div>

          <div className="flex flex-row items-center">
            <TextInput name='password' value={values.password} onChange={handleChange} id="password1" type={eye ? 'text' : 'password'} required />
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
