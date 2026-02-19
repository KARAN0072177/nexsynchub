import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import WorkspaceRole from "@/models/WorkspaceRole";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    const workspace = await Workspace.findOne({
      inviteCode,
      isInviteEnabled: true,
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    const existingMember = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: user._id,
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 400 }
      );
    }

    const defaultRole = await WorkspaceRole.findOne({
      workspaceId: workspace._id,
      name: "Viewer",
    });

    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: user._id,
      roleId: defaultRole?._id,
    });

    return NextResponse.json({
      message: "Joined workspace successfully",
      workspaceId: workspace._id,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}