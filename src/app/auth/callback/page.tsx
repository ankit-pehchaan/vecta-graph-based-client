"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("auth");
  const message = params.get("message");

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/chat");
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          {status === "success" ? "Authentication complete" : "Authentication failed"}
        </h1>
        <p className="text-slate-600 mt-3">
          {status === "success"
            ? "Redirecting you to Vecta..."
            : message || "Please try signing in again."}
        </p>
        {status !== "success" && (
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium"
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}

