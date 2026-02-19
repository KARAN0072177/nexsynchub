import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { registerSchema } from "@/validators/auth.validator";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, email, password } = parsed.data;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate token
    const { token, hashedToken, expiry } =
      generateVerificationToken();

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken: hashedToken,
      verificationTokenExpiry: expiry
    });

    // Send email
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      {
        message:
          "Verification email sent. Please check your inbox."
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}