import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./routes/Home";
import ErrorPage from "./routes/ErrorPage";
import Login from "./routes/Login";
import Callback from "./routes/Callback";
import HowTo from './routes/HowTo';
import Tracks from './routes/Tracks';
import './App.css';
import Downloads from './routes/Downloads';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    loader: async () =>{const response = await fetch(`http://127.0.0.1:5000/check_session`, { credentials: 'include' })
    if(response.ok)
      {  const data = await response.json()
        return data
      } else{
        return null
      }
    },    
    children: [
      {
        path: "/",
        element: <HowTo />,
        
    },
      {
        path: "/login",
        element: <Login/>,
        
    },
      {
        path: "/Home/dash",
        element: <Home />,
        
      },
      {
        path: "/tracks/:id",
        element: <Tracks/>, 
    
      },
      
      {
        path: "/Home/callback",
        element: <Callback />,
        
      },
      {
        path: "/downloads",
        element: <Downloads />,
        
      },
    ],
  },
  

]);

createRoot(document.getElementById("root")).render(
  
  <RouterProvider router={router} />
  
);
