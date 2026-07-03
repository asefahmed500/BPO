"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUp, useSession } from "@/lib/auth-client";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) return null;
  if (session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signUp.email({ name, email, password });
      if (result.error) {
        setError(result.error.message || "Registration failed");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-display font-light text-ink">Northbridge</span>
          </Link>
          <h1 className="text-3xl font-display font-light text-ink">Create account</h1>
          <p className="text-muted text-sm mt-2">Get started with your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-hairline rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm text-body-strong mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-body-strong mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-body-strong mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 bg-white border border-hairline rounded-xl text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-ink transition-colors"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-on-primary rounded-xl text-sm font-medium hover:bg-primary-active transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-ink underline underline-offset-2 hover:no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
