import { Schema, model, models, Types } from "mongoose";

const TaskSchema = new Schema(
  {
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // 👇 MULTIPLE ASSIGNEES
    assignees: [
      {
        type: Types.ObjectId,
        ref: "User",
      }
    ],

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👇 MESSAGE → TASK LINK
    sourceMessageId: {
      type: Types.ObjectId,
      ref: "Message",
    },

    sourceChannelId: {
      type: Types.ObjectId,
      ref: "Channel",
    },
  },
  { timestamps: true }
);

export default models.Task || model("Task", TaskSchema);