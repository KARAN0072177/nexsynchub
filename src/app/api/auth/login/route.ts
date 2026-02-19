import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { loginSchema } from "@/validators/auth.validator";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;

    // Find by email OR username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login successful"
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}