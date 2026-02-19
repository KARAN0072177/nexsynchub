import { Schema, model, models, Types } from "mongoose";

const WorkspaceRoleSchema = new Schema(
  {
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    permissions: {
      type: [String],
      default: [],
    },

    isSystemRole: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

WorkspaceRoleSchema.index(
  { workspaceId: 1, name: 1 },
  { unique: true }
);

export default models.WorkspaceRole ||
  model("WorkspaceRole", WorkspaceRoleSchema);