import { Schema, model, models, Types } from "mongoose";

/* ================================
   Attachment Sub-Schema
================================ */
const AttachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    size: {
      type: Number, // bytes
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    provider: {
      type: String,
      enum: ["s3", "cloudinary"],
      required: true,
    },
  },
  { _id: false }
);

/* ================================
   Message Schema
================================ */
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

    // For text message or link
    content: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "file", "image", "video", "audio", "link"],
      default: "text",
    },

    // For file-based messages
    attachment: {
      type: AttachmentSchema,
      default: null,
    },
  },
  { timestamps: true }
);

/* ================================
   Index for Faster Chat Loading
================================ */
MessageSchema.index({ channelId: 1, createdAt: 1 });

export default models.Message || model("Message", MessageSchema);