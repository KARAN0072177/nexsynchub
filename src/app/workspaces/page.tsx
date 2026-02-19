"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Workspace {
  _id: string;
  name: string;
  createdBy: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    async function load() {
      const meRes = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const meData = await meRes.json();
      setUserId(meData.user.userId);

      const wsRes = await fetch("/api/workspaces/my", {
        credentials: "include",
        cache: "no-store",
      });
      const wsData = await wsRes.json();
      setWorkspaces(wsData.workspaces || []);
    }

    load();
  }, []);

  const created = workspaces.filter(
    w => w.createdBy === userId
  );

  const joined = workspaces.filter(
    w => w.createdBy !== userId
  );

  return (
    <div className="max-w-3xl mx-auto p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Workspaces</h1>

        <div className="space-x-3">
          <Link
            href="/workspaces/create"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Create
          </Link>

          <Link
            href="/workspaces/join"
            className="border px-4 py-2 rounded"
          >
            Join
          </Link>
        </div>
      </div>

      {/* Created */}
      <h2 className="font-semibold mb-2">
        Created by You
      </h2>

      {created.length === 0 && (
        <p className="text-gray-500 mb-4">
          No created workspaces
        </p>
      )}

      <ul className="space-y-2 mb-6">
        {created.map(ws => (
          <li
            key={ws._id}
            className="border p-3 rounded hover:bg-gray-50"
          >
            <Link href={`/workspace/${ws._id}/dashboard`}>
              {ws.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* Joined */}
      <h2 className="font-semibold mb-2">
        Joined Workspaces
      </h2>

      {joined.length === 0 && (
        <p className="text-gray-500">
          No joined workspaces
        </p>
      )}

      <ul className="space-y-2">
        {joined.map(ws => (
          <li
            key={ws._id}
            className="border p-3 rounded hover:bg-gray-50"
          >
            <Link href={`/workspace/${ws._id}/dashboard`}>
              {ws.name}
            </Link>
          </li>
        ))}
      </ul>

    </div>
  );
}