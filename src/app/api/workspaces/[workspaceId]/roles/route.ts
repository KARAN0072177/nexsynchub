import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import WorkspaceRole from "@/models/WorkspaceRole";
import { requireAuth } from "@/lib/requireAuth";
import { requirePermission } from "@/lib/requirePermission";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await context.params;

  try {
    await connectDB();

    const user = await requireAuth();

    // Only members with member.updateRole can load roles
    await requirePermission(
      user.userId,
      workspaceId,
      "members.view"
    );

    const roles = await WorkspaceRole.find({ workspaceId });

    return NextResponse.json({ roles });

  } catch {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}