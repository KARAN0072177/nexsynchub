import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import { requireAuth } from "@/lib/requireAuth";
import { cookies } from "next/headers";
import Workspace from "@/models/Workspace";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    console.log("COOKIE IN API:", cookieStore.get("token"));

    const user = await requireAuth();

    const memberships = await WorkspaceMember.find({
      userId: user.userId,
      isActive: true,
    }).populate("workspaceId");

    const workspaces = memberships.map((m) => m.workspaceId);

    return NextResponse.json({ workspaces });

  } catch (error) {
    console.log("ERROR:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}