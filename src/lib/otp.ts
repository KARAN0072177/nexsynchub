import crypto from "crypto";

export function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOTP = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return {
    otp,
    hashedOTP,
    expiry
  };
}