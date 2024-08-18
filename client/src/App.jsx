// src/index.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./routes/Home";
import ErrorPage from "./routes/ErrorPage";
import Login from "./routes/Login";
import { UserProvider } from './components/UserContext.jsx';

const fetchData = async () => {
  try {
    const response = await fetch('/api/check_session', { credentials: 'include' });
    if (response.status === 401) {
      return { needsLogin: true };
    }
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Received non-JSON response');
    }
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
    return { needsLogin: true };
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    loader: fetchData,
    children: [
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <UserProvider> {/* Wrap your app in UserProvider */}
    <RouterProvider router={router} />
  </UserProvider>
);
