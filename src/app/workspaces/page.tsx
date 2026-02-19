"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Workspace {
    _id: string;
    name: string;
}

export default function WorkspacesPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/workspaces/my", {
                credentials: "include",
            });
            const data = await res.json();
            setWorkspaces(data.workspaces || []);
            setLoading(false);
        }

        load();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6">

            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">My Workspaces</h1>

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

            <ul className="space-y-3">
                {workspaces.map(ws => (
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