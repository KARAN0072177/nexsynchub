import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { requirePermission } from "@/lib/requirePermission";
import Channel from "@/models/Channel";
import Workspace from "@/models/Workspace";

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
      "channels.create"
    );

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Channel name required" },
        { status: 400 }
      );
    }

    const channel = await Channel.create({
      workspaceId,
      name: name.toLowerCase(),
      createdBy: user.userId,
    });

    return NextResponse.json({ channel });

  } catch (error) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}

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
      "chat.view"
    );

    const channels = await Channel.find({
      workspaceId,
    }).sort({ createdAt: 1 });

    return NextResponse.json({ channels });

  } catch (error) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}