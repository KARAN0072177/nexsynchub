"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ChannelsSidebar from "./workspace/ChannelsSidebar";

export default function WorkspaceSidebar() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  return (
    <aside className="w-64 bg-black border-r border-neutral-800 p-5">

      <h2 className="text-lg font-semibold text-neutral-200 mb-6">
        NexSyncHub
      </h2>

      <nav className="space-y-1">

        <Link
          href={`/workspace/${workspaceId}/dashboard`}
          className="block px-3 py-2 rounded-md text-sm text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
        >
          Dashboard
        </Link>

        <Link
          href={`/workspace/${workspaceId}/members`}
          className="block px-3 py-2 rounded-md text-sm text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
        >
          Members
        </Link>

        <Link
          href={`/workspace/${workspaceId}/tasks`}
          className="block hover:text-white"
        >
          Tasks
        </Link>

        <ChannelsSidebar />

      </nav>

    </aside>
  );
}