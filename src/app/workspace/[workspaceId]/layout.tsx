"use client";

import { ReactNode } from "react";
import WorkspaceSidebar from "@/app/components/WorkspaceSideBar";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <WorkspaceSidebar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}