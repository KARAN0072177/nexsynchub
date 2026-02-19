import { Schema, model, models, Types } from "mongoose";

const WorkspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
    },

    avatar: {
      type: String,
    },

    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },

    isInviteEnabled: {
      type: Boolean,
      default: true,
    },

    inviteExpiresAt: {
      type: Date,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Workspace || model("Workspace", WorkspaceSchema);