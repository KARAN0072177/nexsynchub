"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(60);

    const identifier =
        typeof window !== "undefined"
            ? localStorage.getItem("resetIdentifier")
            : null;

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, otp })
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error);
            return;
        }

        router.push("/reset-password");
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6 border rounded-lg">
                <h1 className="text-xl font-semibold mb-4">Enter OTP</h1>

                <form onSubmit={handleVerify} className="space-y-3">
                    <input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP"
                        required
                        className="input"
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button className="btn-primary w-full">
                        Verify OTP
                    </button>
                </form>

                {countdown > 0 ? (
                    <p className="mt-3 text-sm">
                        Resend OTP in {countdown}s
                    </p>
                ) : (
                    <button
                        onClick={async () => {
                            await fetch("/api/auth/resend-otp", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    identifier: localStorage.getItem("resetIdentifier")
                                })
                            });

                            setCountdown(60);
                        }}
                        className="text-blue-500 text-sm mt-3"
                    >
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
}