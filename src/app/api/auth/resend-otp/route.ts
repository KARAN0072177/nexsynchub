import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateOTP } from "@/lib/otp";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    await connectDB();

    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json(
        { error: "Identifier required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return NextResponse.json({
        message: "If an account exists, OTP has been sent."
      });
    }

    const { otp, hashedOTP, expiry } = generateOTP();

    user.passwordResetOTP = hashedOTP;
    user.passwordResetOTPExpiry = expiry;
    await user.save();

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: [user.email],
      subject: "Your new NexSyncHub OTP",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New OTP</h2>
          <h1>${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
        </div>
      `
    });

    return NextResponse.json({
      message: "OTP resent"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}