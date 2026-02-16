"use client";

import Link from "next/link";
import { ArrowLeft, KeyRound, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toShadowEmail } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: toShadowEmail(email),
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated orbs */}
      <div className="orb orb-teal w-[500px] h-[500px] top-[-15%] left-[-10%]" />
      <div className="orb orb-amber w-[400px] h-[400px] bottom-[-15%] right-[-10%]" />
      <div className="orb orb-blue w-[300px] h-[300px] top-[40%] right-[20%]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-grid-pattern" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Website
        </Link>

        {/* Login Card */}
        <div className="glass-strong rounded-3xl p-8 md:p-10 gradient-border">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[#0EA5E9] flex items-center justify-center shadow-lg shadow-[var(--color-primary-glow)]">
              <KeyRound size={20} className="text-white" />
            </div>
            <div>
              <span className="font-[family-name:var(--font-heading)] font-bold text-white text-lg">
                Client Portal
              </span>
              <p className="text-[var(--color-text-muted)] text-xs">
                Genesoft Infotech
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-xs text-center">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-[family-name:var(--font-heading)] uppercase tracking-widest text-[var(--color-text-muted)] mb-2"
              >
                Username
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  type="text"
                  id="login-username"
                  name="email"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-glass-border)] text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  placeholder="e.g. jdoe"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-[family-name:var(--font-heading)] uppercase tracking-widest text-[var(--color-text-muted)] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-glass-border)] text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-4 h-4 rounded border border-[var(--color-glass-border)] peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] transition-colors flex items-center justify-center">
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    fill="none"
                    className="opacity-0 peer-checked:opacity-100"
                  >
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Remember me
                </span>
              </label>
              <span
                className="text-xs text-[var(--color-text-muted)] cursor-default"
                title="Contact admin to reset your password"
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/contact"
              className="text-[var(--color-primary)] hover:underline"
            >
              Contact us
            </Link>{" "}
            for access.
          </p>
        </div>
      </div>
    </div>
  );
}
