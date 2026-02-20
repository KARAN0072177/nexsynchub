"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface User {
  _id: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  assignees: User[];
}

export default function TasksPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<"all" | "mine">("all");
  const [myUserId, setMyUserId] = useState("");

  // Get current user
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => setMyUserId(data.user.userId));
  }, []);

  // Load tasks
  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/tasks`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setTasks(data.tasks));
  }, [workspaceId]);

  const visibleTasks =
    view === "all"
      ? tasks
      : tasks.filter(t =>
          t.assignees.some(a => a._id === myUserId)
        );

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Tasks</h1>

        <div className="space-x-3">
          <button
            onClick={() => setView("all")}
            className={`px-3 py-1 ${
              view === "all"
                ? "bg-black text-white"
                : "border"
            }`}
          >
            All Tasks
          </button>

          <button
            onClick={() => setView("mine")}
            className={`px-3 py-1 ${
              view === "mine"
                ? "bg-black text-white"
                : "border"
            }`}
          >
            My Tasks
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {visibleTasks.map(task => (
          <div
            key={task._id}
            className="border p-4 rounded"
          >
            <div className="flex justify-between">

              <div>
                <h3 className="font-medium">
                  {task.title}
                </h3>

                <p className="text-sm text-gray-400">
                  Priority: {task.priority}
                </p>

                <p className="text-sm text-gray-400">
                  Status: {task.status}
                </p>
              </div>

              <div className="text-sm">
                <p className="text-gray-400 mb-1">
                  Assignees
                </p>

                {task.assignees.map(a => (
                  <div key={a._id}>
                    {a.email}
                  </div>
                ))}
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}