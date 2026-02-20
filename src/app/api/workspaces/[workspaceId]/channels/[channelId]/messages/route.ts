import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { requirePermission } from "@/lib/requirePermission";
import Message from "@/models/Message";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      workspaceId: string;
      channelId: string;
    }>;
  }
) {
  const { workspaceId, channelId } = await context.params;

  try {
    await connectDB();

    const user = await requireAuth();

    await requirePermission(
      user.userId,
      workspaceId,
      "chat.view"
    );

    const messages = await Message.find({
      workspaceId,
      channelId,
    })
      .populate("senderId", "username")
      .sort({ createdAt: 1 });

    return NextResponse.json({ messages });

  } catch {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      workspaceId: string;
      channelId: string;
    }>;
  }
) {
  const { workspaceId, channelId } = await context.params;

  try {
    await connectDB();

    const user = await requireAuth();

    await requirePermission(
      user.userId,
      workspaceId,
      "chat.send"
    );

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    const message = await Message.create({
      workspaceId,
      channelId,
      senderId: user.userId,
      content,
    });

    return NextResponse.json({ message });

  } catch {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}