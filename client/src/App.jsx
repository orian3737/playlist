import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./routes/Home";
import ErrorPage from "./routes/ErrorPage";
import Login from "./routes/Login";
import Callback from "./routes/Callback";
import HowTo from './routes/HowTo'
import './App.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    loader: async () =>{ return fetch(`http://127.0.0.1:5000/check_session`, { credentials: 'include' }) },
    
    children: [
      {
        path: "/",
        element: <HowTo />,
        
    },
      {
        path: "/Login",
        element: <Login/>,
        
    },
      {
        path: "/Home/dash",
        element: <Home />,
        
      },
      
      {
        path: "/Home/callback",
        element: <Callback />,
        
      },
    ],
  },
  

]);

createRoot(document.getElementById("root")).render(
  
  <RouterProvider router={router} />
  
);
