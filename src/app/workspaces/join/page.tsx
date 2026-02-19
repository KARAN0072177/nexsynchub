"use client";

import { useState } from "react";
import Link from "next/link";

export default function JoinWorkspacePage() {
    const [code, setCode] = useState("");
    const [joinedWorkspaceId, setJoinedWorkspaceId] = useState<string | null>(null);

    async function handleJoin() {
        const res = await fetch("/api/workspaces/join", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inviteCode: code }),
        });

        const data = await res.json();

        if (res.ok) {
            setJoinedWorkspaceId(data.workspaceId);
        }

        else {
            alert(data.error || "Failed");
        }
    }

    if (joinedWorkspaceId) {
        return (
            <div className="max-w-md mx-auto p-6 border rounded">

                <h1 className="text-xl font-bold mb-2">
                    Joined Workspace 🎉
                </h1>

                <p className="mb-4">
                    You joined workspace with ID: <b>{joinedWorkspaceId}</b>
                </p>

                <div className="flex gap-3">
                    <Link
                        href="/workspaces"
                        className="bg-black text-white px-4 py-2 rounded"
                    >
                        View Workspaces
                    </Link>

                    <button
                        onClick={() => {
                            setJoinedWorkspaceId(null);
                            setCode("");
                        }}
                        className="border px-4 py-2 rounded"
                    >
                        Join Another
                    </button>
                </div>

            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6">

            <h1 className="text-xl font-bold mb-4">
                Join Workspace
            </h1>

            <input
                className="border w-full p-2 mb-4"
                placeholder="Invite Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />

            <button
                onClick={handleJoin}
                className="bg-black text-white px-4 py-2 rounded"
            >
                Join
            </button>

        </div>
    );
}