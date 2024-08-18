import React, { useState } from 'react';
import { Button, Card, Label, TextInput } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignupForm({ newUser }) {
  const [eye, setEye] = useState(false);
  const [confirmEye, setConfirmEye] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Perform signup logic here

  };

  return (
    <div className="flex justify-center">
      <Card className="max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="fullName" value="Full Name" />
            </div>
            <TextInput id="fullName" type="text" placeholder="John Doe" required />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Your Email" />
            </div>
            <TextInput id="email" type="email" placeholder="john@example.com" required />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="username" value="Username" />
            </div>
            <TextInput id="username" type="text" placeholder="johndoe" required />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value="Password" />
            </div>
            <div className="flex flex-row items-center">
              <TextInput
                id="password"
                type={`${eye ? 'text' : 'password'}`}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setEye(!eye)}
                className="ml-2"
              >
                {eye ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword" value="Confirm Password" />
            </div>
            <div className="flex flex-row items-center">
              <TextInput
                id="confirmPassword"
                type={`${confirmEye ? 'text' : 'password'}`}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setConfirmEye(!confirmEye)}
                className="ml-2"
              >
                {confirmEye ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          <Button type="submit">Sign Up</Button>
        </form>
      </Card>
    </div>
  );
}

export default SignupForm;
