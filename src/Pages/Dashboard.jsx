import React from "react";
import TaskBoard from "../components/TaskBoard";
import TaskForm from "../components/TaskForm";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  console.log("Current user:", user);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>

      {user && (
        <div className="flex items-center mb-6 bg-blue-200 justify-center p-4 rounded-lg">
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

      <TaskForm />

      <TaskBoard />
    </div>
  );
}
