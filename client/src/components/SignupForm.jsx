import React, { useState } from 'react';
import { Button, Card, Label, TextInput } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';

function SignupForm() {
  const [eye, setEye] = useState(false);
  const [confirmEye, setConfirmEye] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, username: email }),
      });

      if (response.ok) {
        alert("Sign up successful! You can now log in.");
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      alert("Sign up failed");
    }
  };

  return (
    <div className="signup-form-container">
      <Card className="signup-card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Label htmlFor="fullName" value="Full Name" />
          <TextInput
            id="fullName"
            type="text"
            placeholder="Your Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Label htmlFor="email" value="Your Email" />
          <TextInput
            id="email"
            type="email"
            placeholder="youremail@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Label htmlFor="password" value="Password" />
          <div className="flex flex-row items-center">
            <TextInput
              id="password"
              type={eye ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => setEye(!eye)} type="button">
              {eye ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <Label htmlFor="confirmPassword" value="Confirm Password" />
          <div className="flex flex-row items-center">
            <TextInput
              id="confirmPassword"
              type={confirmEye ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={() => setConfirmEye(!confirmEye)} type="button">
              {confirmEye ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <Button className="signup-button" type="submit">Sign Up</Button>
        </form>
      </Card>
    </div>
  );
}

export default SignupForm;
