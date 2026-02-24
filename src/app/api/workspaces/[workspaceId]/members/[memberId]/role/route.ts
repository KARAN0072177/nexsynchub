import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import { requireAuth } from "@/lib/requireAuth";
import { requirePermission } from "@/lib/requirePermission";

export async function PATCH(
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
      "members.updateRole"
    );

    const { roleId } = await req.json();

    await WorkspaceMember.findByIdAndUpdate(
      memberId,
      { roleId }
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("PATCH ROLE ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Forbidden" },
      { status: error?.status || 500 }
    );
  }
}