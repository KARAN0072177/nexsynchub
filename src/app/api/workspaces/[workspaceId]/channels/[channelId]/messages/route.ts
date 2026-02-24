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

    const { content, type, attachment } = await req.json();

    // Must have either text OR attachment
    if (!content && !attachment) {
      return NextResponse.json(
        { error: "Message must contain text or attachment" },
        { status: 400 }
      );
    }

    const message = await Message.create({
      workspaceId,
      channelId,
      senderId: user.userId,
      type: type || "text",
      content: content || null,
      attachment: attachment || null
    });

    const populatedMessage = await message.populate(
      "senderId",
      "username"
    );

    return NextResponse.json({ message: populatedMessage });

    return NextResponse.json({ message });

  } catch {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}