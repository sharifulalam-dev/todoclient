import { createBrowserRouter } from "react-router-dom";

import MainLayout from "./../MainLayout/MainLayout";
import Dashboard from "./../Pages/Dashboard";
import Home from "./../Pages/Home";
import Login from "./../Pages/Login";
import Register from "./../Pages/Register";
import PrivateRoute from "./../PrivateRoute/PrivateRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,

    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

export default router;
