"use client";

import { ReactNode } from "react";
import WorkspaceSidebar from "@/app/components/WorkspaceSideBar";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-black text-neutral-200">

      {/* Sidebar */}
      <WorkspaceSidebar />

      {/* Main Content */}
      <main className="flex-1 border-l border-neutral-800 p-6 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}