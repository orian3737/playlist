import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./routes/Home";
import ErrorPage from "./routes/ErrorPage";
import Login from "./routes/Login";
import Callback from "./routes/Callback";

const router = createBrowserRouter([
  {
    path: "/Home",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    loader: async () => {
      const response = await fetch('http://localhost:5000/check_session', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to check session');
      }
      return response;
    },
    children: [
      {
        path: "/Home/dash",
        element: <Home />,
      },
      
      {
        path: "/Home/callback",
        element: <Callback />,
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
      path: "/login",
      element: <Login/>
  },
],
  },
]);

createRoot(document.getElementById("root")).render(
  
  <RouterProvider router={router} />
  
);
