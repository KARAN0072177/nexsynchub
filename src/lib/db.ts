import mongoose from "mongoose";

// 👇 FORCE MODEL REGISTRATION
import "@/models/User";
import "@/models/Workspace";
import "@/models/WorkspaceRole";
import "@/models/WorkspaceMember";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  return mongoose.connect(process.env.MONGODB_URI as string);
}