import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import User from "@/models/User";
import WorkspaceMember from "@/models/WorkspaceMember";
import WorkspaceRole from "@/models/WorkspaceRole";
import { requireAuth } from "@/lib/requireAuth";
import { requirePermission } from "@/lib/requirePermission";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    await connectDB();

    const user = await requireAuth();

    await requirePermission(
      user.userId,
      params.workspaceId,
      "members.invite"
    );

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const targetUser = await User.findOne({ email });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const existingMember = await WorkspaceMember.findOne({
      workspaceId: params.workspaceId,
      userId: targetUser._id,
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User already a member" },
        { status: 400 }
      );
    }

    const defaultRole = await WorkspaceRole.findOne({
      workspaceId: params.workspaceId,
      name: "Viewer",
    });

    if (!defaultRole) {
      return NextResponse.json(
        { error: "Default role missing" },
        { status: 500 }
      );
    }

    await WorkspaceMember.create({
      workspaceId: params.workspaceId,
      userId: targetUser._id,
      roleId: defaultRole._id,
      invitedBy: user.userId,
    });

    return NextResponse.json({
      message: "User invited successfully",
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}