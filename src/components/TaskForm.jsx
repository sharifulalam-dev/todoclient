// File: src/components/TaskForm.jsx
import axios from "axios";
import React, { useState } from "react";

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("To-Do");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!title) {
      setError("Title is required.");
      return;
    }
    if (title.length > 50) {
      setError("Title must be 50 characters or less.");
      return;
    }
    if (description && description.length > 200) {
      setError("Description must be 200 characters or less.");
      return;
    }

    try {
      // Include withCredentials so the JWT cookie is sent.
      const response = await axios.post(
        "https://todo-server-alpha-sand.vercel.app/tasks",
        {
          title,
          description,
          category,
        },
        { withCredentials: true }
      );

      // Reset fields
      setTitle("");
      setDescription("");
      setCategory("To-Do");
      setError(null);

      // Optionally handle the newly created task,
      // e.g., showing a success message or adding it to local state
      console.log("Task added:", response.data);
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Error adding task. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="mb-2">
        <label className="block mb-1">Title:</label>
        <input
          type="text"
          className="w-full border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          required
        />
      </div>

      <div className="mb-2">
        <label className="block mb-1">Description:</label>
        <textarea
          className="w-full border p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="mb-2">
        <label className="block mb-1">Category:</label>
        <select
          className="w-full border p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="To-Do">To-Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        Add Task
      </button>
    </form>
  );
}
