"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Member {
  _id: string;
  userId: {
    _id: string;
    username: string;
  };
  roleId: {
    _id: string;
    name: string;
  };
}

interface Role {
  _id: string;
  name: string;
}

export default function MembersPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Members + Roles
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

    async function loadRoles() {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/roles`,
        { credentials: "include" }
      );
      const data = await res.json();
      setRoles(data.roles || []);
    }

    loadMembers();
    loadRoles();
  }, [workspaceId]);

  async function updateRole(memberId: string, roleId: string) {
    await fetch(
      `/api/workspaces/${workspaceId}/members/${memberId}/role`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      }
    );

    // Reload members
    const res = await fetch(
      `/api/workspaces/${workspaceId}/members`,
      { credentials: "include" }
    );
    const data = await res.json();
    setMembers(data.members || []);
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member from workspace?")) return;

    await fetch(
      `/api/workspaces/${workspaceId}/members/${memberId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    // Reload members
    const res = await fetch(
      `/api/workspaces/${workspaceId}/members`,
      { credentials: "include" }
    );
    const data = await res.json();
    setMembers(data.members || []);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-neutral-400 flex items-center justify-center">
        Loading members...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-200 p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-semibold mb-6">
          Workspace Members
        </h1>

        <div className="border border-neutral-800 rounded-lg overflow-hidden">

          <table className="w-full">
            <thead className="bg-neutral-900">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-neutral-400">
                  Username
                </th>

                <th className="p-3 text-left text-sm font-medium text-neutral-400">
                  Role
                </th>

                <th className="p-3 text-left text-sm font-medium text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {members.map((m) => (
                <tr
                  key={m._id}
                  className="border-t border-neutral-800"
                >

                  {/* Username */}
                  <td className="p-3 text-sm">
                    {m.userId.username}
                  </td>

                  {/* Role Dropdown */}
                  <td className="p-3">
                    <select
                      value={m.roleId._id}
                      onChange={(e) =>
                        updateRole(m._id, e.target.value)
                      }
                      className="bg-neutral-900 border border-neutral-700 text-sm p-1 rounded"
                    >
                      {roles.map((r) => (
                        <option
                          key={r._id}
                          value={r._id}
                        >
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Remove Button */}
                  <td className="p-3">
                    <button
                      onClick={() => removeMember(m._id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </td>

                </tr>
              ))}

              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
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