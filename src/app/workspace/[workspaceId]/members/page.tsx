"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Member {
    _id: string;
    userId: {
        email: string;
    };
    roleId: {
        name: string;
    };
}

export default function MembersPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMembers() {
            const res = await fetch(
                `/api/workspaces/${workspaceId}/members`,
                { credentials: "include" }
            );
            const data = await res.json();
            setMembers(data.members || []);
            setLoading(false);
        }

        loadMembers();
    }, [workspaceId]);

    if (loading)
        return (
            <div className="min-h-screen bg-black text-neutral-400 flex items-center justify-center">
                Loading members...
            </div>
        );

    return (
        <div className="min-h-screen bg-black text-neutral-200 p-8">
            <div className="max-w-3xl mx-auto">

                <h1 className="text-2xl font-semibold mb-6">
                    Workspace Members
                </h1>

                <div className="border border-neutral-800 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-neutral-900">
                            <tr>
                                <th className="p-3 text-left text-sm font-medium text-neutral-400">
                                    Email
                                </th>
                                <th className="p-3 text-left text-sm font-medium text-neutral-400">
                                    Role
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {members.map((m) => (
                                <tr
                                    key={m._id}
                                    className="border-t border-neutral-800"
                                >
                                    <td className="p-3 text-sm">
                                        {m.userId.email}
                                    </td>
                                    <td className="p-3 text-sm text-neutral-400">
                                        {m.roleId.name}
                                    </td>
                                </tr>
                            ))}

                            {members.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="p-6 text-center text-neutral-500 text-sm"
                                    >
                                        No members yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}