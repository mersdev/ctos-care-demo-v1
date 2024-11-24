import React, { useEffect, useState } from "react";
import { Task } from "../../types/task";
import { TaskService } from "../../services/task-service";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const TaskView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const taskService = TaskService.getInstance();
      const storedTasks = await taskService.getTasks();
      setTasks(Array.isArray(storedTasks) ? storedTasks : []);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getCategoryIcon = (category: Task["category"]) => {
    switch (category) {
      case "payment":
        return "💰";
      case "credit":
        return "💳";
      case "legal":
        return "⚖️";
      default:
        return "📋";
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    try {
      setLoading(true);
      const taskService = TaskService.getInstance();

      // Update local state immediately
      const updatedTasks = tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status:
                task.status === "completed"
                  ? ("pending" as const)
                  : ("completed" as const),
            }
          : task
      );
      setTasks(updatedTasks);

      // Update in background
      await taskService.toggleTaskStatus(taskId);
    } catch (error) {
      console.error("Error toggling task status:", error);
      // Revert on error
      await loadTasks();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Your Tasks
        </h2>
        <div className="space-y-4">
          {Array.isArray(tasks) && tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="mt-1"
                      disabled={loading}
                    >
                      {task.status === "completed" ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-green-500 transition-colors" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="text-2xl"
                          role="img"
                          aria-label={task.category}
                        >
                          {getCategoryIcon(task.category)}
                        </span>
                        <h3
                          className={`text-lg font-medium ${
                            task.status === "completed"
                              ? "text-gray-400 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          task.status === "completed"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span
                          className={`text-sm font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}{" "}
                          Priority
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskView;
