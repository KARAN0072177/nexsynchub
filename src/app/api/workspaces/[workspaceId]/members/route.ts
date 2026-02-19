import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import WorkspaceRole from "@/models/WorkspaceRole";
import { requireAuth } from "@/lib/requireAuth";
import { requirePermission } from "@/lib/requirePermission";

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await connectDB();

    const user = await requireAuth(req);

    await requirePermission(
      user.userId,
      params.workspaceId,
      "members.invite"
    );

    const members = await WorkspaceMember.find({
      workspaceId: params.workspaceId,
      isActive: true,
    })
      .populate("userId", "email")
      .populate("roleId", "name");

    return NextResponse.json({ members });

  } catch (error) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}