"use client";

import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { getFirebaseClientAuth } from "@/lib/firebase/client";

type AuthMode = "login" | "register";
type SubmitState = "google" | "password" | null;

export function LoginForm() {
  return <AuthForm mode="login" />;
}

export function RegisterForm() {
  return <AuthForm mode="register" />;
}

function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegister = mode === "register";
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<SubmitState>(null);
  const nextPath = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);
  const safeNextPath = nextPath.startsWith("/") ? nextPath : "/dashboard";
  const alternateHref = `${isRegister ? "/login" : "/register"}?next=${encodeURIComponent(
    safeNextPath,
  )}`;

  async function finishSignIn(user: User) {
    const token = await user.getIdToken(true);
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

    router.replace(safeNextPath);
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

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting("password");
    setError(null);

    try {
      const auth = getFirebaseClientAuth();
      const cleanEmail = email.trim();
      const cleanDisplayName = displayName.trim();
      const result = isRegister
        ? await createUserWithEmailAndPassword(auth, cleanEmail, password)
        : await signInWithEmailAndPassword(auth, cleanEmail, password);

      if (isRegister && cleanDisplayName) {
        await updateProfile(result.user, { displayName: cleanDisplayName });
      }

      await finishSignIn(result.user);
    } catch (caught) {
      setError(getAuthErrorMessage(caught));
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-6">
      <button
        className="min-h-14 w-full rounded-md bg-worldCupBlue px-5 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(27,77,255,0.18)] transition hover:bg-[#1742d6] focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting !== null}
        type="button"
        onClick={handleGoogleSignIn}
      >
        {submitting === "google"
          ? "Opening Google..."
          : isRegister
            ? "Create account with Google"
            : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 text-sm text-secondaryText">
        <div className="h-px flex-1 bg-borderSoft" />
        <span>{isRegister ? "Or use email" : "Or sign in with email"}</span>
        <div className="h-px flex-1 bg-borderSoft" />
      </div>

      <form className="space-y-4" onSubmit={handlePasswordSubmit}>
        {isRegister ? (
          <label className="block space-y-2" htmlFor="displayName">
            <span className="text-sm font-semibold text-primaryText">Name</span>
            <input
              className="min-h-14 w-full rounded-md border-borderSoft bg-base px-4 py-3 text-base text-primaryText shadow-sm transition placeholder:text-secondaryText/75 focus:border-worldCupBlue focus:ring-2 focus:ring-worldCupBlue"
              autoComplete="name"
              id="displayName"
              placeholder="Alex Morgan"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
        ) : null}

        <label className="block space-y-2" htmlFor="email">
          <span className="text-sm font-semibold text-primaryText">Email</span>
          <input
            className="min-h-14 w-full rounded-md border-borderSoft bg-base px-4 py-3 text-base text-primaryText shadow-sm transition placeholder:text-secondaryText/75 focus:border-worldCupBlue focus:ring-2 focus:ring-worldCupBlue"
            autoComplete="email"
            id="email"
            inputMode="email"
            placeholder="you@example.com"
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="block space-y-2" htmlFor="password">
          <span className="text-sm font-semibold text-primaryText">Password</span>
          <input
            className="min-h-14 w-full rounded-md border-borderSoft bg-base px-4 py-3 text-base text-primaryText shadow-sm transition focus:border-worldCupBlue focus:ring-2 focus:ring-worldCupBlue"
            autoComplete={isRegister ? "new-password" : "current-password"}
            id="password"
            minLength={isRegister ? 6 : undefined}
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {isRegister ? (
            <span className="block text-sm leading-6 text-secondaryText">
              Use at least 6 characters.
            </span>
          ) : null}
        </label>

        <button
          className="min-h-14 w-full rounded-md border border-borderSoft bg-card px-5 py-4 text-base font-semibold text-primaryText transition hover:bg-softSky focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting !== null}
          type="submit"
        >
          {submitting === "password"
            ? isRegister
              ? "Creating account..."
              : "Signing in..."
            : isRegister
              ? "Create account with email"
              : "Sign in with email"}
        </button>
      </form>

      {error ? (
        <div
          className="rounded-md border border-canadaRed/30 bg-softRed px-4 py-3 text-sm leading-6 text-primaryText"
          role="alert"
        >
          <p className="font-semibold">Authentication problem</p>
          {error}
        </div>
      ) : null}

      {!isRegister ? (
        <p className="text-center text-sm leading-6 text-secondaryText">
          Password reset is not available yet. Contact your group organizer if you are blocked.
        </p>
      ) : null}

      <div className="rounded-lg border border-borderSoft bg-base px-4 py-4 text-center text-sm leading-6 text-primaryText">
        {isRegister ? "Already have an account?" : "New here?"}{" "}
        <Link
          className="font-semibold text-worldCupBlue underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2"
          href={alternateHref}
        >
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </div>

      <p className="text-center text-xs leading-5 text-secondaryText">
        No betting or cash pools. MatchPulse is for private groups and World Cup 2026 predictions.
      </p>
    </div>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/weak-password":
        return "Use a stronger password with at least 6 characters.";
      case "auth/email-already-in-use":
        return "An account already exists for this email. Sign in instead.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "The email or password is incorrect.";
      case "auth/user-not-found":
        return "No account was found for this email. Create an account first.";
      case "auth/popup-closed-by-user":
        return "The Google sign-in window was closed before sign-in finished.";
      case "auth/popup-blocked":
        return "Your browser blocked the Google sign-in window. Allow popups and try again.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled for the current Firebase project.";
      default:
        return "Authentication failed. Check your details and try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Sign-in failed. Check your provider settings and try again.";
}
