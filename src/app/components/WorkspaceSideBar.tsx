"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function WorkspaceSidebar() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return (
    <aside className="w-64 bg-white border-r p-4">

      <h2 className="text-xl font-bold mb-6">NexSyncHub</h2>

      <nav className="space-y-3">

        <Link
          href={`/workspace/${workspaceId}/dashboard`}
          className="block text-gray-700 hover:text-black"
        >
          Dashboard
        </Link>

        <Link
          href={`/workspace/${workspaceId}/members`}
          className="block text-gray-700 hover:text-black"
        >
          Members
        </Link>

      </nav>

    </aside>
  );
}