import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-base px-5 py-6 text-primaryText">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-between rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)]">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-worldCupBlue">MatchPulse account</p>
            <h1 className="text-4xl font-semibold">Sign in for your World Cup picks.</h1>
            <p className="text-base leading-7 text-secondaryText">
              Continue with Google to create a secure session and bootstrap your profile.
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-10 text-sm leading-6 text-secondaryText">
          Local development uses the Firebase Auth emulator when `.env.local` is copied from the
          example file.
        </p>
      </section>
    </main>
  );
}
