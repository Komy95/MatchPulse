import { Suspense } from "react";
import { AuthOnboardingShell } from "@/components/auth/auth-onboarding-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthOnboardingShell
      body="Welcome back to your private prediction groups."
      eyebrow="World Cup 2026 predictions"
      title="Sign in"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthOnboardingShell>
  );
}
