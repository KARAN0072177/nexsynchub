"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        return;
      }

      const res = await fetch(
        `/api/auth/verify-email?token=${token}`
      );

      if (res.ok) {
        localStorage.setItem("emailVerified", "true");
        setStatus("success");
      } else {
        setStatus("error");
      }
    }

    verify();
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      router.push("/login");
    }

    return () => clearInterval(interval);
  }, [status, countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 border rounded-lg text-center">

        {status === "loading" && (
          <p>Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-semibold mb-2">
              Email Verified 🎉
            </h1>
            <p>
              Redirecting to login in {countdown}...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold mb-2">
              Verification Failed
            </h1>
            <p>
              Invalid or expired link.
            </p>
          </>
        )}

      </div>
    </div>
  );
}