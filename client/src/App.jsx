import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./routes/Home";
import ErrorPage from "./routes/ErrorPage";
import Login from "./routes/Login";

const router = createBrowserRouter([
  {
    path: "/",
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
        path: "/Home",
        element: <Home />,
      },
      {
        path: "/",
        element: <Login />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
