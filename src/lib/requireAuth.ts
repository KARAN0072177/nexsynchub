import { cookies } from "next/headers";
import { verifyAuthToken } from "./auth";

export async function requireAuth(req: unknown) {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const user = verifyAuthToken(token);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user; // { userId, role }
}