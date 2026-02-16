"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getGoogleAuthUrl,
  login,
  registerInitiate,
  registerVerify,
} from "@/lib/auth";

type Mode = "login" | "register";

export default function AuthLanding() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    otp: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const authUrl = await getGoogleAuthUrl();
      if (authUrl) {
        window.location.href = authUrl;
        return;
      }
      setError("Unable to start Google sign-in.");
    } catch (err) {
      setError((err as Error).message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: formData.email, password: formData.password });
        router.push("/chat");
        return;
      }

      if (step === "form") {
        await registerInitiate({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
        });
        setStep("otp");
        setMessage("Enter the OTP sent to your email.");
        return;
      }

      await registerVerify({ otp: formData.otp });
      router.push("/chat");
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex flex-col lg:flex-row">
      <section className="lg:w-1/2 px-6 py-12 lg:px-16 flex flex-col justify-center">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Vecta AI
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Financial clarity at every step
              </h1>
            </div>
          </div>

          <p className="text-slate-600 text-lg leading-relaxed">
            Vecta turns conversations into a clear financial roadmap. Chat, validate facts,
            run calculations, and simulate scenarios to make confident decisions.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              {
                title: "Chat",
                text: "Explain your goals and constraints naturally.",
              },
              {
                title: "Facts",
                text: "Capture the real data that matters.",
              },
              {
                title: "Calculations",
                text: "Quantify trade-offs with instant results.",
              },
              {
                title: "Simulations",
                text: "Explore future outcomes before you commit.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-2xl bg-white/70 border border-white/60 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lg:w-1/2 px-6 py-12 lg:px-16 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-slate-500">
                {mode === "login"
                  ? "Sign in to continue your session."
                  : step === "form"
                  ? "Start with your details."
                  : "Verify your email to finish."}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode("login");
                setStep("form");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                mode === "login"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setMode("register");
                setStep("form");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                mode === "register"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="space-y-4">
            {mode === "register" && step === "form" && (
              <div className="space-y-3">
                <input
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-ring text-sm"
                />
              </div>
            )}

            {mode === "register" && step === "otp" ? (
              <input
                value={formData.otp}
                onChange={(event) => handleChange("otp", event.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-ring text-sm"
              />
            ) : (
              <>
                <input
                  value={formData.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  placeholder="Email"
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-ring text-sm"
                />
                <input
                  value={formData.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  placeholder="Password"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-ring text-sm"
                />
                {mode === "register" && (
                  <input
                    value={formData.confirm_password}
                    onChange={(event) =>
                      handleChange("confirm_password", event.target.value)
                    }
                    placeholder="Confirm password"
                    type="password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus-ring text-sm"
                  />
                )}
              </>
            )}
          </div>

          {message && <p className="text-sm text-emerald-600 mt-4">{message}</p>}
          {error && <p className="text-sm text-rose-600 mt-4">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium shadow-md hover:opacity-90 transition"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : step === "form"
              ? "Send OTP"
              : "Verify and continue"}
          </button>

          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <span className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Continue with Google
          </button>
        </div>
      </section>
    </div>
  );
}
