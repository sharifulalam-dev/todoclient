// File: src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="text-lg font-bold">
        <Link to="/">Task Manager</Link>
      </div>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-500">
          Home
        </Link>
        <Link to="/dashboard" className="hover:text-blue-500">
          Dashboard
        </Link>
        {!user ? (
          <Link to="/login" className="hover:text-blue-500">
            Login
          </Link>
        ) : (
          <button onClick={handleLogout} className="hover:text-blue-500">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
