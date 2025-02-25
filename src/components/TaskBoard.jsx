import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Swal from "sweetalert2";

import useAuth from "./../hooks/useAuth";
import EditTaskModal from "./EditTaskModal";

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const user = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          "https://todoserver-w7kk.onrender.com/tasks",
          { withCredentials: true }
        );
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Clear tasks if unauthorized
        if (error.response?.status === 401) {
          setTasks([]);
        }
      }
    };

    // Immediately fetch tasks when the component mounts
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
    }

    // Optionally, set up a polling interval to refresh tasks every 5 seconds
    const intervalId = setInterval(() => {
      if (user) fetchTasks();
    }, 1000); // Adjust the interval (ms) as needed

    const socket = io("https://todoserver-w7kk.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("taskCreated", (newTask) => {
      setTasks((prev) => [...prev, newTask]);
    });

    socket.on("taskMoved", (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    });

    socket.on("taskDeleted", (deletedId) => {
      setTasks((prev) => prev.filter((task) => task._id !== deletedId));
    });

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [user]);
  // Dependency on user state

  const columns = {
    "To-Do": {
      id: "To-Do",
      title: "To Do",
      tasks: tasks
        .filter((task) => task.category === "To-Do")
        .sort((a, b) => a.order - b.order),
    },
    "In Progress": {
      id: "In Progress",
      title: "In Progress",
      tasks: tasks
        .filter((task) => task.category === "In Progress")
        .sort((a, b) => a.order - b.order),
    },
    Done: {
      id: "Done",
      title: "Done",
      tasks: tasks
        .filter((task) => task.category === "Done")
        .sort((a, b) => a.order - b.order),
    },
  };

  const reorderList = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    if (sourceCol === destCol) {
      const columnTasks = columns[sourceCol].tasks;
      const newList = reorderList(columnTasks, source.index, destination.index);

      const finalColumn = newList.map((task, idx) => ({
        ...task,
        order: idx,
      }));

      let updated = tasks
        .filter((t) => t.category !== sourceCol)
        .concat(finalColumn);
      setTasks(updated);

      const payload = finalColumn.map((t) => ({ _id: t._id, order: t.order }));
      try {
        await axios.post(
          "https://todoserver-w7kk.onrender.com/tasks/reorderColumn",
          {
            category: sourceCol,
            tasks: payload,
          },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error reordering column:", error);
      }
    } else {
      const sourceTasks = Array.from(columns[sourceCol].tasks);
      const [movedTask] = sourceTasks.splice(source.index, 1);

      const destTasks = Array.from(columns[destCol].tasks);
      destTasks.splice(destination.index, 0, movedTask);

      const newSource = sourceTasks.map((t, idx) => ({
        ...t,
        order: idx,
      }));
      const newDest = destTasks.map((t, idx) => ({
        ...t,
        category: destCol,
        order: idx,
      }));

      let updatedAll = tasks.filter(
        (t) => t.category !== sourceCol && t.category !== destCol
      );
      updatedAll = [...updatedAll, ...newSource, ...newDest];
      setTasks(updatedAll);

      const sourcePayload = newSource.map((t) => ({
        _id: t._id,
        order: t.order,
      }));
      const destPayload = newDest.map((t) => ({
        _id: t._id,
        order: t.order,
        category: destCol,
      }));

      try {
        await axios.post(
          "https://todoserver-w7kk.onrender.com/tasks/reorderColumn",
          {
            categoryUpdates: [
              { category: sourceCol, tasks: sourcePayload },
              { category: destCol, tasks: destPayload },
            ],
          },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error reordering across columns:", error);
      }
    }
  };

  const handleEdit = (task) => {
    setEditTask(task);
  };

  const handleTaskUpdate = async (updatedTask) => {
    try {
      const { _id, title, description, category } = updatedTask;
      const response = await axios.put(
        `https://todoserver-w7kk.onrender.com/tasks/${_id}`,
        { title, description, category },
        { withCredentials: true }
      );
      const newTask = response.data;
      setTasks((prev) =>
        prev.map((t) => (t._id === newTask._id ? newTask : t))
      );
      setEditTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this task!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://todoserver-w7kk.onrender.com/tasks/${taskId}`,
            {
              withCredentials: true,
            }
          );
          setTasks((prev) => prev.filter((t) => t._id !== taskId));
          Swal.fire("Deleted!", "The task has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting task:", error);
        }
      }
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        List Of Activity
      </h1>
      <div className="min-h-screen bg-gray-50 p-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6  pb-4 px- justify-between flex-col md:flex-row">
            {Object.values(columns).map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`
                      rounded-xl p-4 w-80 flex-shrink-0 shadow-sm
                      ${column.id === "To-Do" && "bg-red-50"}
                      ${column.id === "In Progress" && "bg-amber-50"}
                      ${column.id === "Done" && "bg-green-50"}
                      min-h-[500px] border border-gray-100
                    `}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3
                        className={`
                          text-lg font-semibold 
                          ${column.id === "To-Do" && "text-red-600"}
                          ${column.id === "In Progress" && "text-amber-600"}
                          ${column.id === "Done" && "text-green-600"}
                        `}
                      >
                        {column.title}
                      </h3>
                      <span
                        className={`
                          px-2.5 py-1 rounded-full text-sm
                          ${column.id === "To-Do" && "bg-red-100 text-red-700"}
                          ${
                            column.id === "In Progress" &&
                            "bg-amber-100 text-amber-700"
                          }
                          ${
                            column.id === "Done" &&
                            "bg-green-100 text-green-700"
                          }
                        `}
                      >
                        {column.tasks.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                p-4 rounded-lg shadow-xs transition-all duration-200
                                hover:shadow-md cursor-grab active:cursor-grabbing
                                ${
                                  task.category === "To-Do" &&
                                  "bg-white border-l-4 border-red-400 hover:border-red-500"
                                }
                                ${
                                  task.category === "In Progress" &&
                                  "bg-white border-l-4 border-amber-400 hover:border-amber-500"
                                }
                                ${
                                  task.category === "Done" &&
                                  "bg-white border-l-4 border-green-400 hover:border-green-500"
                                }
                              `}
                            >
                              <p className="text-gray-800 font-medium">
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex justify-end mt-3 space-x-2">
                                <button
                                  onClick={() => handleEdit(task)}
                                  className={`
                                    p-1 rounded hover:bg-gray-100
                                    ${
                                      task.category === "To-Do" &&
                                      "text-red-500 hover:text-red-700"
                                    }
                                    ${
                                      task.category === "In Progress" &&
                                      "text-amber-500 hover:text-amber-700"
                                    }
                                    ${
                                      task.category === "Done" &&
                                      "text-green-500 hover:text-green-700"
                                    }
                                  `}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(task._id)}
                                  className={`
                                    p-1 rounded hover:bg-gray-100
                                    ${
                                      task.category === "To-Do" &&
                                      "text-red-500 hover:text-red-700"
                                    }
                                    ${
                                      task.category === "In Progress" &&
                                      "text-amber-500 hover:text-amber-700"
                                    }
                                    ${
                                      task.category === "Done" &&
                                      "text-green-500 hover:text-green-700"
                                    }
                                  `}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}
    </>
  );
};

export default TaskBoard;
