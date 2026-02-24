import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";

import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* =======================
   AWS S3 CLIENT
======================= */

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/* =======================
   CLOUDINARY CONFIG
======================= */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/* =======================
   RULES
======================= */

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const BLOCKED_EXT = ["exe", "bat", "sh", "msi"];

/* =======================
   POST
======================= */

export async function POST(req: NextRequest) {
  try {
    const { filename, mimeType, size } = await req.json();

    if (!filename || !mimeType || !size) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large" },
        { status: 400 }
      );
    }

    const ext = filename.split(".").pop()?.toLowerCase();

    if (ext && BLOCKED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    const id = uuidv4();

    /* =======================
       IMAGE / VIDEO → CLOUDINARY
    ======================= */

    if (mimeType.startsWith("image/") || mimeType.startsWith("video/")) {
      const timestamp = Math.round(Date.now() / 1000);

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          public_id: `chat/${id}`,
        },
        process.env.CLOUDINARY_API_SECRET!
      );

      return NextResponse.json({
        provider: "cloudinary",
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        signature,
        publicId: `chat/${id}`,
        folder: "chat",
      });
    }

    /* =======================
       EVERYTHING ELSE → S3
    ======================= */

    const key = `chat/${id}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60,
    });

    return NextResponse.json({
      provider: "s3",
      uploadUrl,
      key,
      fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Upload init failed" },
      { status: 500 }
    );
  }
}