import { Schema, model, models, Types } from "mongoose";

const WorkspaceMemberSchema = new Schema(
  {
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    roleId: {
      type: Types.ObjectId,
      ref: "WorkspaceRole",
      required: true,
    },

    invitedBy: {
      type: Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "joinedAt" } }
);

WorkspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
);

export default models.WorkspaceMember ||
  model("WorkspaceMember", WorkspaceMemberSchema);