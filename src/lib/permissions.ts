import WorkspaceMember from "@/models/WorkspaceMember";
import WorkspaceRole from "@/models/WorkspaceRole";

export async function hasWorkspacePermission(
  userId: string,
  workspaceId: string,
  permission: string
) {
  const member = await WorkspaceMember.findOne({
    userId,
    workspaceId,
    isActive: true,
  });

  if (!member) return false;

  const role = await WorkspaceRole.findById(member.roleId);

  if (!role) return false;

  return role.permissions.includes(permission);
}