import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { hasWorkspacePermission } from "@/lib/permissions";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await context.params;

  try {
    const user = await requireAuth();

    const canSend = await hasWorkspacePermission(
      user.userId,
      workspaceId,
      "chat.send"
    );

    return NextResponse.json({ canSend });

  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}