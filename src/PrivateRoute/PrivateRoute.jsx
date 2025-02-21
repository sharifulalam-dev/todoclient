import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Authprovider/Authprovider";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Redirect to the login page if the user is not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}
