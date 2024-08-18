import React, { useState } from 'react';
import { Button, Card, Label, TextInput } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import './LoginForm.css';

function LoginForm({ newUser }) {
  const [eye, setEye] = useState(false);

  const handleSubmit = async () => {};

  return (
    <div className="login-form-container">
      <Card className="login-card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email1" value="Your email" />
            <TextInput id="email1" type="text" placeholder="yourname@example.com" required />
          </div>
          <div className="text-red-500">
  This should be red if Tailwind is working.
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
