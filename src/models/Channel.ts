import { Schema, model, models, Types } from "mongoose";

const ChannelSchema = new Schema(
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

    isPrivate: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

ChannelSchema.index(
  { workspaceId: 1, name: 1 },
  { unique: true }
);

export default models.Channel ||
  model("Channel", ChannelSchema);