import { Types } from "mongoose";
import WorkspaceMember from "@/models/WorkspaceMember";
import WorkspaceRole from "@/models/WorkspaceRole";

const DEBUG_PERMISSIONS = true; // turn off in production

export async function hasWorkspacePermission(
  userId: string,
  workspaceId: string,
  permission: string
) {
  if (DEBUG_PERMISSIONS) {
    console.log("🔐 Checking permission:", permission);
    console.log("User:", userId);
    console.log("Workspace:", workspaceId);
  }

  const member = await WorkspaceMember.findOne({
    userId: new Types.ObjectId(userId),
    workspaceId: new Types.ObjectId(workspaceId),
    isActive: true,
  });

  if (!member) {
    if (DEBUG_PERMISSIONS) {
      console.log("❌ No workspace membership found");
    }
    return false;
  }

  if (DEBUG_PERMISSIONS) {
    console.log("✅ Member found:", member._id.toString());
    console.log("RoleId:", member.roleId.toString());
  }

  const role = await WorkspaceRole.findById(member.roleId);

  if (!role) {
    if (DEBUG_PERMISSIONS) {
      console.log("❌ Role not found");
    }
    return false;
  }

  if (DEBUG_PERMISSIONS) {
    console.log("Role:", role.name);
    console.log("Permissions:", role.permissions);
  }

  const allowed = role.permissions.includes(permission);

  if (DEBUG_PERMISSIONS) {
    console.log(
      allowed ? "✅ Permission GRANTED" : "⛔ Permission DENIED"
    );
  }

  return allowed;
}