import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const buttonClasses = {
  primary:
    "inline-flex min-h-12 items-center justify-center rounded-md bg-worldCupBlue px-5 py-3 text-center text-sm font-semibold text-white shadow-action transition hover:bg-worldCupBlueDark focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex min-h-12 items-center justify-center rounded-md border border-borderSoft bg-card px-5 py-3 text-center text-sm font-semibold text-primaryText transition hover:border-line hover:bg-pitchMist focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "inline-flex min-h-10 items-center justify-center rounded-sm border border-borderSoft bg-transparent px-4 py-2 text-center text-sm font-semibold text-primaryText transition hover:bg-pitchMist focus:outline-none focus:ring-2 focus:ring-worldCupBlue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  dark:
    "inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 bg-white/12 px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_14px_38px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stadiumNavy",
};

type ButtonVariant = keyof typeof buttonClasses;

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={cn(buttonClasses[variant], className)} {...props} />;
}

export function ButtonLink({
  className,
  variant = "primary",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: ButtonVariant }) {
  return <Link className={cn(buttonClasses[variant], className)} href={href} {...props} />;
}

export function Card({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "pitch" | "dark";
}) {
  return (
    <section
      className={cn(
        "rounded-lg border p-5 shadow-card sm:p-6",
        tone === "default" && "border-borderSoft bg-card",
        tone === "pitch" && "border-line bg-[linear-gradient(135deg,#FFFFFF_0%,#F7FBF7_55%,#EEF7F1_100%)]",
        tone === "dark" && "border-white/12 bg-white/[0.07] text-white shadow-elevated backdrop-blur-md",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function FieldLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("text-sm font-semibold text-primaryText", className)}>{children}</span>;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("min-h-14 w-full rounded-md px-4 py-3 text-base", className)}
      {...props}
    />
  );
}

const badgeClasses = {
  neutral: "border-borderSoft bg-cardWarm text-primaryText",
  blue: "border-worldCupBlue/20 bg-softSky text-worldCupBlue",
  green: "border-pitchGreen/20 bg-pitchMist text-pitchGreenDark",
  red: "border-canadaRed/20 bg-softRed text-canadaRedDark",
  gold: "border-warmGold/30 bg-goldMist text-primaryText",
  dark: "border-white/20 bg-white/12 text-white",
};

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof badgeClasses;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-semibold",
        badgeClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FixtureCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-lg border border-line bg-card p-4 shadow-card",
        "before:absolute before:inset-x-4 before:top-0 before:h-px before:bg-pitchGreen/35",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function ScoreInput({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="block min-h-10 text-sm font-semibold leading-5 text-primaryText">{label}</span>
      <Input
        className={cn(
          "mt-2 h-16 px-3 text-center text-3xl font-semibold tabular-nums",
          "bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBF8_100%)]",
          className,
        )}
        inputMode="numeric"
        type="number"
        {...props}
      />
    </label>
  );
}
