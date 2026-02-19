"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinWorkspacePage() {
    const [code, setCode] = useState("");
    const router = useRouter();

    async function handleJoin() {
        const res = await fetch("/api/workspaces/join", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inviteCode: code }),
        });

        const data = await res.json();

        if (res.ok) {
            router.push(`/workspace/${data.workspaceId}/dashboard`);
        } else {
            alert(data.error || "Failed");
        }
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
                onChange={e => setCode(e.target.value)}
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