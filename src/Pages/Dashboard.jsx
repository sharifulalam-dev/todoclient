// File: src/pages/Dashboard.jsx

import React from "react";
import TaskBoard from "../components/TaskBoard";
import TaskForm from "../components/TaskForm";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth(); // Access the logged-in user's data
  console.log("Current user:", user);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>

      {/* Welcome Section */}
      {user && (
        <div className="flex items-center mb-6 bg-blue-200 justify-center p-4 rounded-lg">
          {/* If user has a photoURL, display it */}
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || "User Photo"}
              className="w-12 h-12 rounded-full mr-3"
            />
          )}
          <div>
            <p className="font-semibold text-lg">
              Welcome, {user.displayName || "User"}
            </p>
            {user.email && (
              <p className="text-gray-600 text-sm">{user.email}</p>
            )}
          </div>
        </div>
      )}

      {/* Task Form for creating a new task */}
      <TaskForm />

      {/* TaskBoard: displays tasks with drag-and-drop functionality */}
      <TaskBoard />
    </div>
  );
}
