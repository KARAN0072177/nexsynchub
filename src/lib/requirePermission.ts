import { hasWorkspacePermission } from "./permissions";

export async function requirePermission(
  userId: string,
  workspaceId: string,
  permission: string
) {
  const allowed = await hasWorkspacePermission(
    userId,
    workspaceId,
    permission
  );

  if (!allowed) {
    throw new Error("Forbidden");
  }
}