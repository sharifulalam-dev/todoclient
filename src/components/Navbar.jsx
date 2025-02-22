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
    <div className="max-w-11/12 mx-auto ">
      <nav className="sticky top-0 z-50 bg-blue-600 p-4 shadow-md flex items-center justify-between">
        <div className="text-xl font-bold text-white">
          <Link to="/">Task Manager</Link>
        </div>

        <div className="space-x-6 flex items-center">
          <Link
            to="/"
            className="text-white hover:text-gray-200 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="text-white hover:text-gray-200 transition-colors"
          >
            Dashboard
          </Link>
          {!user ? (
            <Link
              to="/login"
              className="text-white hover:text-gray-200 transition-colors"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-200 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
