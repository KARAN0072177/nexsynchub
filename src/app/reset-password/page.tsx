"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const identifier =
    typeof window !== "undefined"
      ? localStorage.getItem("resetIdentifier")
      : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier,
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword")
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    localStorage.removeItem("resetIdentifier");

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-lg">
        <h1 className="text-xl font-semibold mb-4">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="password"
            type="password"
            placeholder="New Password"
            required
            className="input"
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            required
            className="input"
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button className="btn-primary w-full">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}