"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const identifier = formData.get("identifier") as string;

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier })
    });

    await res.json();

    localStorage.setItem("resetIdentifier", identifier);

    setMessage("If an account exists, OTP has been sent.");
    setLoading(false);

    setTimeout(() => {
      router.push("/verify-otp");
    }, 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-lg">
        <h1 className="text-xl font-semibold mb-4">
          Forgot Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="identifier"
            placeholder="Email or Username"
            required
            className="input"
          />

          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        {message && <p className="mt-3 text-sm">{message}</p>}
      </div>
    </div>
  );
}