import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import { requireAuth } from "@/lib/requireAuth";
import { requirePermission } from "@/lib/requirePermission";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  const { workspaceId, memberId } = await context.params;

  try {
    await connectDB();

    const user = await requireAuth();

    await requirePermission(
      user.userId,
      workspaceId,
      "members.remove"
    );

    await WorkspaceMember.findByIdAndDelete(memberId);

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}