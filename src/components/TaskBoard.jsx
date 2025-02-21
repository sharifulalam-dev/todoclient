import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa"; // Import edit and delete icons
import { io } from "socket.io-client";

const socket = io("http://localhost:9000");

export default function TaskBoard() {
  // State: tasks grouped by category
  const [columns, setColumns] = useState({
    todo: [],
    "in-progress": [],
    done: [],
  });
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const dropHandledRef = useRef(false);

  // Initialize socket connection and listen for updates
  useEffect(() => {
    socket.on("taskMoved", (updatedTask) => {
      updateTaskInColumns(updatedTask);
    });

    return () => {
      socket.off("taskMoved");
    };
  }, []);

  // Fetch tasks from the backend and group them by category
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:9000/tasks");
        const tasks = await res.json();
        const grouped = { todo: [], "in-progress": [], done: [] };
        tasks.forEach((task) => {
          if (task.category === "To-Do") {
            grouped.todo.push(task);
          } else if (task.category === "In Progress") {
            grouped["in-progress"].push(task);
          } else if (task.category === "Done") {
            grouped.done.push(task);
          }
        });
        setColumns(grouped);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Helper function to update task in columns state after a move
  const updateTaskInColumns = (updatedTask) => {
    setColumns((prevColumns) => {
      const newColumns = { ...prevColumns };
      // Remove the task from the old column
      Object.keys(newColumns).forEach((col) => {
        newColumns[col] = newColumns[col].filter(
          (task) => task._id !== updatedTask._id
        );
      });
      // Add the task to the new category
      newColumns[updatedTask.category].push(updatedTask);
      return newColumns;
    });
  };

  // Helper: update task in the database and emit socket event
  const updateTaskInDB = async (task, targetColumn, targetIndex) => {
    const updateData = { category: targetColumn, order: targetIndex };
    try {
      const res = await axios.put(
        `http://localhost:9000/tasks/${task._id}`,
        updateData
      );
      if (res.status === 200) {
        socket.emit("taskMoved", { ...task, ...updateData });
      } else {
        console.error("Failed to update task:", res.data.message);
      }
    } catch (error) {
      console.error("Error updating task in DB:", error);
    }
  };

  // Handle dragging start, store the task's column and index
  const handleDragStart = (e, sourceColumn, index, taskId) => {
    e.dataTransfer.effectAllowed = "move";
    dropHandledRef.current = false;
    setDraggingTaskId(taskId);
    const dragData = { sourceColumn, index };
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
  };

  // Handle task drop (inside a column)
  const handleDropOnTask = (e, targetColumn, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    dropHandledRef.current = true;
    const data = e.dataTransfer.getData("application/json");
    const { sourceColumn, index: sourceIndex } = JSON.parse(data);

    if (sourceColumn === targetColumn && sourceIndex === targetIndex) return;

    let movedTask = null;
    setColumns((prev) => {
      const newColumns = { ...prev };
      const sourceTasks = [...newColumns[sourceColumn]];
      const targetTasks = [...newColumns[targetColumn]];

      movedTask = sourceTasks[sourceIndex];
      sourceTasks.splice(sourceIndex, 1);
      targetTasks.splice(targetIndex, 0, movedTask);

      newColumns[sourceColumn] = sourceTasks;
      newColumns[targetColumn] = targetTasks;

      return newColumns;
    });

    if (movedTask) {
      updateTaskInDB(movedTask, targetColumn, targetIndex);
    }
  };

  // Handle drop on the container (when task is dropped into an empty space)
  const handleDropOnContainer = (e, targetColumn) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropHandledRef.current) {
      dropHandledRef.current = false;
      return;
    }
    const data = e.dataTransfer.getData("application/json");
    const { sourceColumn, index: sourceIndex } = JSON.parse(data);

    let movedTask = null;
    setColumns((prev) => {
      const newColumns = { ...prev };
      const sourceTasks = [...newColumns[sourceColumn]];
      if (sourceIndex >= sourceTasks.length) return prev;

      movedTask = sourceTasks[sourceIndex];
      sourceTasks.splice(sourceIndex, 1);
      newColumns[sourceColumn] = sourceTasks;
      newColumns[targetColumn] = [...newColumns[targetColumn], movedTask];
      return newColumns;
    });

    if (movedTask) {
      updateTaskInDB(movedTask, targetColumn, newColumns[targetColumn].length);
    }
  };

  // Task column titles
  const columnTitles = {
    todo: "To Do",
    "in-progress": "In Progress",
    done: "Done",
  };

  // Delete task handler
  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:9000/tasks/${taskId}`);
      socket.emit("taskDeleted", taskId);
      // Remove task from the state
      setColumns((prevColumns) => {
        const newColumns = { ...prevColumns };
        Object.keys(newColumns).forEach((col) => {
          newColumns[col] = newColumns[col].filter(
            (task) => task._id !== taskId
          );
        });
        return newColumns;
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Task Board</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {Object.keys(columns).map((colId) => (
          <div key={colId} className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {columnTitles[colId]}
            </h2>
            <div
              className="p-4 rounded border transition-colors duration-200"
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => {
                if (e.target === e.currentTarget) {
                  setDragOverColumn(colId);
                }
              }}
              onDragLeave={(e) => {
                if (e.target === e.currentTarget) {
                  setDragOverColumn(null);
                }
              }}
              onDrop={(e) => handleDropOnContainer(e, colId)}
            >
              {columns[colId].map((task, index) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, colId, index, task._id)
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnTask(e, colId, index)}
                  onDragEnd={() => setDraggingTaskId(null)}
                  className="p-4 mb-3 bg-white rounded shadow cursor-move border border-gray-200"
                >
                  <h3 className="text-lg font-bold text-gray-900">
                    {task.title}
                  </h3>
                  <p className="text-gray-600">{task.description}</p>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                    <button
                      // Edit functionality can be implemented here
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
