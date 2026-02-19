import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token missing" },
        { status: 400 }
      );
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}