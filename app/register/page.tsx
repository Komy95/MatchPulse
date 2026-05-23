import { Suspense } from "react";
import { AuthOnboardingShell } from "@/components/auth/auth-onboarding-shell";
import { RegisterForm } from "@/components/auth/login-form";

export default function RegisterPage() {
  return (
    <AuthOnboardingShell
      body="Create an account and start your first group."
      eyebrow="Mobile-first football picks"
      title="Create account"
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthOnboardingShell>
  );
}
