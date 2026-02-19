import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { identifier, otp } = await req.json();

    if (!identifier || !otp) {
      return NextResponse.json(
        { error: "Identifier and OTP required" },
        { status: 400 }
      );
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
      passwordResetOTP: hashedOTP,
      passwordResetOTPExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "OTP verified"
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    );
  }
}