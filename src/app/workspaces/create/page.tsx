"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreateWorkspacePage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any>(null);

  async function handleCreate() {
    if (!name) return alert("Enter workspace name");

    setLoading(true);

    const res = await fetch("/api/workspaces", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (res.ok) {
      setCreated(data.workspace);
    } else {
      alert(data.error || "Failed");
    }

    setLoading(false);
  }

  if (created) {
    return (
      <div className="max-w-md mx-auto p-6 border rounded">

        <h1 className="text-xl font-bold mb-2">
          Workspace Created 🎉
        </h1>

        <p className="mb-2">Invite Code</p>

        <div className="bg-gray-100 p-3 rounded font-mono mb-4">
          {created.inviteCode}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/workspace/${created._id}/members`}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Go to Members
          </Link>

          <Link
            href="/workspaces"
            className="border px-4 py-2 rounded"
          >
            Back to Workspaces
          </Link>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">

      <h1 className="text-xl font-bold mb-4">
        Create Workspace
      </h1>

      <input
        className="border w-full p-2 mb-4"
        placeholder="Workspace name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Creating..." : "Create"}
      </button>

    </div>
  );
}