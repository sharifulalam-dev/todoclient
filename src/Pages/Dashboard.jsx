// File: src/pages/Dashboard.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import EditTaskModal from "../components/EditTaskModal";
import TaskBoard from "../components/TaskBoard";
import TaskForm from "../components/TaskForm";
import useAuth from "../hooks/useAuth";

const socket = io("http://localhost:9000");

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await axios.get("http://localhost:9000/tasks");
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
    fetchTasks();
  }, []);

  // Socket listeners for realtime updates
  useEffect(() => {
    socket.on("taskCreated", (newTask) => {
      setTasks((prev) => [...prev, newTask]);
    });
    socket.on("taskUpdated", ({ id, updateFields }) => {
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, ...updateFields } : task
        )
      );
    });
    socket.on("taskMoved", (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
    });
    socket.on("taskDeleted", (id) => {
      setTasks((prev) => prev.filter((task) => task._id !== id));
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskMoved");
      socket.off("taskDeleted");
    };
  }, []);

  // onDragEnd: Handles both reordering within the same column and moving between columns.
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const draggedTask = tasks.find((task) => task._id === draggableId);
    if (!draggedTask) return;

    // Check if category changed (moving between columns)
    if (draggedTask.category !== destination.droppableId) {
      try {
        const updatedTask = {
          ...draggedTask,
          category: destination.droppableId,
        };
        await axios.put(
          `http://localhost:9000/tasks/${draggedTask.category}/${draggedTask._id}`,
          updatedTask
        );
        socket.emit("taskMoved", updatedTask);
      } catch (err) {
        console.error("Error updating task on drag:", err);
      }
    } else {
      // Reordering within the same column:
      // 1. Create a new ordering locally
      const columnTasks = tasks
        .filter((task) => task.category === draggedTask.category)
        .sort((a, b) => a.order - b.order);

      // Remove draggedTask from its current position
      const [removed] = columnTasks.splice(source.index, 1);
      // Insert it at the new position
      columnTasks.splice(destination.index, 0, removed);

      // 2. Update the order field for tasks in this column
      const updatedTasks = columnTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      // 3. Update the local tasks state
      setTasks((prev) =>
        prev.map((task) =>
          task.category === draggedTask.category
            ? updatedTasks.find((t) => t._id === task._id) || task
            : task
        )
      );

      // 4. Optionally, call an API endpoint to update order in the backend
      // For each task in updatedTasks, update the order field.
    }
  };

  // Delete a task (pass full task object so we know its category)
  const handleDelete = async (task) => {
    try {
      await axios.delete(
        `http://localhost:9000/tasks/${task.category}/${task._id}`
      );
      socket.emit("taskDeleted", task._id);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Open edit modal with selected task data
  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Update task after editing
  const handleUpdate = async (updatedTask) => {
    try {
      await axios.put(
        `http://localhost:9000/tasks/${updatedTask.category}/${updatedTask._id}`,
        updatedTask
      );
      socket.emit("taskUpdated", updatedTask);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* TaskForm: for adding new tasks */}
      <TaskForm />

      {/* TaskBoard: displays tasks with drag-and-drop */}
      <TaskBoard
        tasks={tasks}
        onDragEnd={onDragEnd}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* EditTaskModal: shown when a task is selected for editing */}
      {isModalOpen && (
        <EditTaskModal
          task={selectedTask}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
