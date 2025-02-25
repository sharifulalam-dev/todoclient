import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

  const activeStyle = {
    color: "orangered",
  };

  return (
    <div className="max-w-11/12 mx-auto">
      <nav className="sticky top-0 z-50 bg-blue-600 p-4 shadow-md flex items-center justify-between">
        <div className="text-xl font-bold text-white">
          <NavLink to="/">Task Manager</NavLink>
        </div>

        <div className="space-x-6 flex items-center">
          <NavLink
            to="/"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            Dashboard
          </NavLink>
          {!user ? (
            <NavLink
              to="/login"
              style={({ isActive }) => (isActive ? activeStyle : undefined)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              Login
            </NavLink>
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
