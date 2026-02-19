import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth(req);

    const memberships = await WorkspaceMember.find({
      userId: user.userId,
      isActive: true,
    }).populate("workspaceId");

    const workspaces = memberships.map((m) => m.workspaceId);

    return NextResponse.json({ workspaces });

  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}