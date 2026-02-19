"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: formData.get("identifier"),
        password: formData.get("password")
      }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    // Login successful
    router.push("/dashboard"); // Temporary redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-lg">
        <h1 className="text-2xl font-semibold mb-4">
          Login to NexSyncHub
        </h1>

        <form onSubmit={handleLogin} className="space-y-3">

          <input
            name="identifier"
            placeholder="Email or Username"
            required
            className="input"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="input"
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

      </div>
    </div>
  );
}