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
                `/api/workspaces/${workspaceId}/members`
                , {
                    credentials: "include",
                });
            const data = await res.json();
            setMembers(data.members || []);
            setLoading(false);
        }

        loadMembers();
    }, [workspaceId]);

    if (loading) return <p>Loading members...</p>;

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">
                Workspace Members
            </h1>

            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Email</th>
                        <th className="border p-2 text-left">Role</th>
                    </tr>
                </thead>

                <tbody>
                    {members.map((m) => (
                        <tr key={m._id}>
                            <td className="border p-2">{m.userId.email}</td>
                            <td className="border p-2">{m.roleId.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}