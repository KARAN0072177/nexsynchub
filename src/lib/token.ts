import crypto from "crypto";

export function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return {
    token,
    hashedToken,
    expiry
  };
}