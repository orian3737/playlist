import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Label, TextInput } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUserContext } from '../components/UserContext';
import './SignupForm.css';

function SignUpForm({ setForm }) {
  const [eye, setEye] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userData, setUserData } = useUserContext();
  const [values, setValues] = useState({
    username: '',
    display_name: '',
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
    setIsLoading(true);

    const url = 'http://127.0.0.1:5000/signup';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: values.username,
        display_name: values.display_name,
        password: values.password,
      }),
      credentials: 'include'
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("HTTP error " + response.status);
      }
    })
    .then((data) => {
      console.log('Success', data);
      setUserData(data);
      navigate('/Home/dash');
    })
    .catch((error) => {
      console.error('Signup Error:', error);
      alert("Signup Failed: " + error.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="signup-form-container">
      <Card className="signup-card rounded-lg  shadow-lg shadow-spotify border-spotify">
        <form onSubmit={(e)=>handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="username" value="Your username" />
            <TextInput 
              id="username" 
              name="username"
              type="text" 
              placeholder="Username" 
              required 
              value={values.username}
              onChange={handleChange}
              className='text-black'
            />
          </div>
          <div>
            <Label htmlFor="display_name" value="Display Name" />
            <TextInput 
              id="display_name" 
              name="display_name"
              type="text" 
              placeholder="Display Name" 
              required 
              value={values.display_name}
              onChange={handleChange}
              className='text-black'
            />
          </div>
          <div className="flex flex-row items-center">
            <TextInput 
              id="password1" 
              name="password"
              type={eye ? 'text' : 'password'} 
              placeholder="Password"
              required 
              value={values.password}
              onChange={handleChange}
            />
            <button onClick={() => setEye(!eye)} type="button">
              {eye ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <Button className="signup-btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </Button>
          <div className="text-red-500">
            Already have an account? <span onClick={() => setForm(true)}>Log in!</span>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SignUpForm;