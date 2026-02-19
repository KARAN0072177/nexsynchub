import { Schema, model, models, Types } from "mongoose";

const MessageSchema = new Schema(
  {
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    channelId: {
      type: Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["text"],
      default: "text",
    },
  },
  { timestamps: true }
);

export default models.Message ||
  model("Message", MessageSchema);