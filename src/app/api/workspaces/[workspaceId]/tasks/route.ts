import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { requirePermission } from "@/lib/requirePermission";
import Task from "@/models/Task";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await context.params;

  try {
    await connectDB();

    const user = await requireAuth();

    await requirePermission(
      user.userId,
      workspaceId,
      "tasks.create"
    );

    const {
      title,
      description,
      assignees,
      priority,
      sourceMessageId,
      sourceChannelId,
    } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const task = await Task.create({
      workspaceId,
      title,
      description,
      priority,
      assignees: assignees || [],
      createdBy: user.userId,
      sourceMessageId,
      sourceChannelId,
    });

    return NextResponse.json({ task });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}

// 👇 GET ALL TASKS FOR A WORKSPACE

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await context.params;

  try {
    await connectDB();

    const user = await requireAuth();

    await requirePermission(
      user.userId,
      workspaceId,
      "tasks.create"
    );

    const tasks = await Task.find({ workspaceId })
      .populate("assignees", "username")
      .sort({ createdAt: -1 });

    return NextResponse.json({ tasks });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}