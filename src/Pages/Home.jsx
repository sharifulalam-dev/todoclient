// File: src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Task Manager App</h1>
      <p className="mb-6 text-lg text-gray-700">
        Organize your tasks efficiently and boost your productivity with our
        simple and intuitive task management system.
      </p>
      <Link
        to="/login"
        className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}
