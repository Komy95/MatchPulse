"use client";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"google" | "password" | null>(null);
  const nextPath = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);

  async function finishSignIn(user: User) {
    const token = await user.getIdToken();
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ idToken: token }),
    });

    if (!response.ok) {
      throw new Error("Unable to create a secure session.");
    }

    router.replace(nextPath.startsWith("/") ? nextPath : "/dashboard");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setSubmitting("google");
    setError(null);

    try {
      const result = await signInWithPopup(getFirebaseClientAuth(), new GoogleAuthProvider());
      await finishSignIn(result.user);
    } catch (caught) {
      setError(getAuthErrorMessage(caught));
      setSubmitting(null);
    }
  }

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting("password");
    setError(null);

    try {
      const result = await signInWithEmailAndPassword(
        getFirebaseClientAuth(),
        email.trim(),
        password,
      );
      await finishSignIn(result.user);
    } catch (caught) {
      setError(getAuthErrorMessage(caught));
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-5">
      <button
        className="w-full rounded-md bg-worldCupBlue px-5 py-4 text-base font-semibold text-white transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting !== null}
        type="button"
        onClick={handleGoogleSignIn}
      >
        {submitting === "google" ? "Opening Google..." : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 text-xs text-secondaryText">
        <div className="h-px flex-1 bg-borderSoft" />
        <span>Local test fallback</span>
        <div className="h-px flex-1 bg-borderSoft" />
      </div>

      <form className="space-y-4" onSubmit={handlePasswordSignIn}>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input
            className="w-full rounded-md border-borderSoft bg-base px-4 py-3 text-base"
            autoComplete="email"
            inputMode="email"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <input
            className="w-full rounded-md border-borderSoft bg-base px-4 py-3 text-base"
            autoComplete="current-password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button
          className="w-full rounded-md border border-borderSoft bg-card px-5 py-4 text-base font-semibold transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting !== null}
          type="submit"
        >
          {submitting === "password" ? "Signing in..." : "Sign in with email"}
        </button>
      </form>

      {error ? (
        <div className="rounded-md border border-canadaRed/20 bg-softRed px-4 py-3 text-sm text-primaryText">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Sign-in failed. Check your provider settings and try again.";
}
