import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Workspace from "@/models/Workspace";
import WorkspaceRole from "@/models/WorkspaceRole";
import WorkspaceMember from "@/models/WorkspaceMember";
import { requireAuth } from "@/lib/requireAuth";
import { nanoid } from "nanoid";

const ALL_PERMISSIONS = [
  "workspace.manage",
  "workspace.delete",
  "workspace.invite",

  "roles.create",
  "roles.update",
  "roles.delete",

  "members.invite",
  "members.remove",
  "members.updateRole",

  "channels.create",
  "channels.delete",

  "tasks.create",
  "tasks.update",
  "tasks.assign",
  "tasks.delete",

  "chat.send",
  "chat.delete",

  "files.upload",
  "files.delete",

  "analytics.view",
];

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Workspace name is required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + nanoid(4);
    const inviteCode = "NXH-" + nanoid(6).toUpperCase();

    // Create Workspace
    const workspace = await Workspace.create({
      name,
      slug,
      description,
      inviteCode,
      createdBy: user._id,
    });

    // Create Owner Role
    const ownerRole = await WorkspaceRole.create({
      workspaceId: workspace._id,
      name: "Owner",
      description: "Full access to workspace",
      permissions: ALL_PERMISSIONS,
      isSystemRole: true,
    });

    // Create Default Roles
    await WorkspaceRole.insertMany([
      {
        workspaceId: workspace._id,
        name: "Manager",
        permissions: [
          "tasks.create",
          "tasks.update",
          "tasks.assign",
          "members.invite",
          "chat.send",
          "files.upload",
          "analytics.view",
        ],
      },
      {
        workspaceId: workspace._id,
        name: "Developer",
        permissions: [
          "tasks.update",
          "chat.send",
          "files.upload",
        ],
      },
      {
        workspaceId: workspace._id,
        name: "Viewer",
        permissions: [],
      },
    ]);

    // Add Creator as Owner
    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: user._id,
      roleId: ownerRole._id,
    });

    return NextResponse.json({
      message: "Workspace created successfully",
      workspace,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}