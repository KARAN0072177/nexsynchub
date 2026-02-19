import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import WorkspaceRole from "@/models/WorkspaceRole";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await connectDB();

    const user = await requireAuth(req);

    const workspace = await Workspace.findById(params.workspaceId);

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const member = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: user.userId,
      isActive: true,
    });

    if (!member) {
      return NextResponse.json(
        { error: "Not a member of workspace" },
        { status: 403 }
      );
    }

    const role = await WorkspaceRole.findById(member.roleId);

    return NextResponse.json({
      workspace,
      role: role?.name,
      permissions: role?.permissions || [],
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}