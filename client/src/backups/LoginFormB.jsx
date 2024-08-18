import React, {useState} from 'react'
import { Button, Card, Checkbox, Label, TextInput } from "flowbite-react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";


function LoginForm({newUser}) {
  const [eye, setEye]=useState(false)

    const handleSubmit = async () =>{

    }




  return (
  <div className="flex justify-center">
        <Card className="max-w-sm">
      <form onSubmit={()=>{handleSubmit()}} className="flex flex-col gap-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email1" value="Your email" />
          </div>
          <TextInput id="Username" type="text" placeholder="bombmaclott26" required />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="password1" value="Your password" />
          </div>
          <div className='flex flex-row'>
          <TextInput id="password1" type={`${eye? 'text':'password'}`} required />
          <button onClick={()=>{
                                 setEye(!eye)
                }}>
            {eye? <FaEye /> : <FaEyeSlash />}

          </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Card>
  </div>
  )
}

export default LoginForm