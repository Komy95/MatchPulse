import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/login-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-base px-4 py-5 text-primaryText sm:px-6 sm:py-8">
      <section className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-md flex-col justify-between rounded-xl border border-borderSoft bg-card p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)] sm:min-h-[calc(100vh-4rem)] sm:p-8">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-worldCupBlue">Create account</p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-[2.75rem]">
              Start your World Cup 2026 picks.
            </h1>
            <p className="text-lg leading-8 text-secondaryText">
              Join private groups, save predictions, and track standings without betting noise or
              clutter.
            </p>
          </div>

          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>

        <p className="mt-10 rounded-lg bg-softGreen px-4 py-3 text-sm leading-6 text-primaryText">
          Registration creates your Firebase account, then MatchPulse bootstraps your profile
          through the secure server session flow.
        </p>
      </section>
    </main>
  );
}
