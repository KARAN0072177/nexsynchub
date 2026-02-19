import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        await connectDB();

        const { identifier, password, confirmPassword } =
            await req.json();

        const userAgent = req.headers.get("user-agent") || "Unknown Device";
        const ip =
            req.headers.get("x-forwarded-for") ||
            "Unknown IP";

        const time = new Date().toLocaleString();

        if (!identifier || !password || !confirmPassword) {
            return NextResponse.json(
                { error: "All fields required" },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Passwords do not match" },
                { status: 400 }
            );
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user.password = hashedPassword;
        user.passwordResetOTP = undefined;
        user.passwordResetOTPExpiry = undefined;

        await user.save();

        // Send security alert email
        await resend.emails.send({
            from: process.env.EMAIL_FROM as string,
            to: [user.email],
            subject: "Your NexSyncHub password was changed",
            html: `
    <div style="font-family: Arial, sans-serif;">
      <h2>Password Changed</h2>
      <p>Your password was successfully updated.</p>

      <hr/>

      <p><strong>Device:</strong> ${userAgent}</p>
      <p><strong>IP Address:</strong> ${ip}</p>
      <p><strong>Time:</strong> ${time}</p>

      <hr/>

      <p>If this wasn't you, contact support immediately.</p>
    </div>
  `
        });

        return NextResponse.json({
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Password reset failed" },
            { status: 500 }
        );
    }
}