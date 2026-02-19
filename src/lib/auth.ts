import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  role: string;
}

export function verifyAuthToken(token: string) {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    return decoded;
  } catch (error) {
    return null;
  }
}