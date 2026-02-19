"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateWorkspacePage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      router.push(`/workspace/${data.workspace._id}/dashboard`);
    } else {
      alert(data.error || "Failed");
    }

    setLoading(false);
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
        onChange={e => setName(e.target.value)}
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