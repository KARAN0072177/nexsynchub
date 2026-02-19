"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const params = useSearchParams();

    const [view, setView] = useState<"FORM" | "VERIFY_SENT" | "VERIFIED">("FORM");
    const [emailSentTo, setEmailSentTo] = useState("");

    // If user comes back after verification
    useEffect(() => {
        function checkVerified() {
            const verified = localStorage.getItem("emailVerified");

            if (verified === "true" || params.get("verified") === "true") {
                setView("VERIFIED");
                localStorage.removeItem("emailVerified");
            }
        }

        // Initial check
        checkVerified();

        // Listen for changes from other tabs
        window.addEventListener("storage", checkVerified);

        return () => {
            window.removeEventListener("storage", checkVerified);
        };
    }, [params]);

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const res = await fetch("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                username: formData.get("username"),
                email: formData.get("email"),
                password: formData.get("password"),
                confirmPassword: formData.get("confirmPassword")
            }),
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        setEmailSentTo(formData.get("email") as string);
        setView("VERIFY_SENT");
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6 border rounded-lg">

                {view === "FORM" && (
                    <>
                        <h1 className="text-2xl font-semibold mb-4">Create account</h1>

                        <form onSubmit={handleRegister} className="space-y-3">
                            <input name="username" placeholder="Username" required className="input" />
                            <input name="email" type="email" placeholder="Email" required className="input" />
                            <input name="password" type="password" placeholder="Password" required className="input" />
                            <input name="confirmPassword" type="password" placeholder="Confirm Password" required className="input" />

                            <button className="btn-primary w-full">Register</button>
                        </form>
                    </>
                )}

                {view === "VERIFY_SENT" && (
                    <div className="text-center space-y-3">
                        <h2 className="text-xl font-semibold">Verify your email</h2>
                        <p>
                            We sent a verification link to <b>{emailSentTo}</b>
                        </p>
                        <p>Click the link to activate your account.</p>
                    </div>
                )}

                {view === "VERIFIED" && (
                    <div className="text-center space-y-3">
                        <h2 className="text-xl font-semibold">Email Verified 🎉</h2>
                        <p>Your account is now active.</p>
                        <button
                            onClick={() => router.push("/login")}
                            className="btn-primary w-full"
                        >
                            Go to Login
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}