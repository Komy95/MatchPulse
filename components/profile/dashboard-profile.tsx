"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getFirebaseClientAuth, getFirebaseClientFirestore } from "@/lib/firebase/client";
import { updateUserProfile } from "@/lib/profile/client";
import type { UserConsent, UserProfile } from "@/lib/profile/types";
import { Button, Card, FieldLabel, Input } from "@/components/ui/primitives";

type FormState = {
  locale: string;
  countryCode: string;
  favoriteTeamIds: string;
  followedTeamIds: string;
  globalLeaderboardOptIn: boolean;
  consent: UserConsent;
};

export function DashboardProfile({ uid }: { uid: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<FormState>(getEmptyForm());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(doc(getFirebaseClientFirestore(), "users", uid), (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }

      const nextProfile = snapshot.data() as UserProfile;
      setProfile(nextProfile);
      setForm({
        locale: nextProfile.locale,
        countryCode: nextProfile.countryCode ?? "",
        favoriteTeamIds: nextProfile.favoriteTeamIds.join(", "),
        followedTeamIds: nextProfile.followedTeamIds.join(", "),
        globalLeaderboardOptIn: nextProfile.globalLeaderboardOptIn,
        consent: nextProfile.consent,
      });
    });
  }, [uid]);

  const identity = useMemo(() => {
    if (!profile) {
      return "Loading profile...";
    }

    return profile.displayName || profile.email || uid;
  }, [profile, uid]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateUserProfile(uid, {
        locale: form.locale.trim() || "en-US",
        countryCode: normalizeCountryCode(form.countryCode),
        favoriteTeamIds: parseTeamIds(form.favoriteTeamIds),
        followedTeamIds: parseTeamIds(form.followedTeamIds),
        globalLeaderboardOptIn: form.globalLeaderboardOptIn,
        consent: form.consent,
      });
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut(getFirebaseClientAuth());
    router.replace("/login");
    router.refresh();
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-secondaryText">Signed in as</p>
          <h2 className="mt-1 break-words text-2xl font-semibold">{identity}</h2>
        </div>
        <Button
          className="shrink-0"
          variant="ghost"
          type="button"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <FieldLabel>Locale</FieldLabel>
          <Input
            value={form.locale}
            onChange={(event) => setForm({ ...form, locale: event.target.value })}
          />
        </label>

        <label className="block space-y-2">
          <FieldLabel>Country code</FieldLabel>
          <Input
            className="uppercase"
            maxLength={2}
            placeholder="US"
            value={form.countryCode}
            onChange={(event) => setForm({ ...form, countryCode: event.target.value })}
          />
        </label>

        <label className="block space-y-2">
          <FieldLabel>Favorite team IDs</FieldLabel>
          <Input
            placeholder="usa, mexico"
            value={form.favoriteTeamIds}
            onChange={(event) => setForm({ ...form, favoriteTeamIds: event.target.value })}
          />
        </label>

        <label className="block space-y-2">
          <FieldLabel>Followed team IDs</FieldLabel>
          <Input
            placeholder="canada, japan"
            value={form.followedTeamIds}
            onChange={(event) => setForm({ ...form, followedTeamIds: event.target.value })}
          />
        </label>

        <label className="flex items-center gap-3 rounded-md border border-borderSoft bg-base px-4 py-3">
          <input
            className="rounded border-borderSoft text-worldCupBlue focus:ring-worldCupBlue"
            checked={form.globalLeaderboardOptIn}
            type="checkbox"
            onChange={(event) =>
              setForm({ ...form, globalLeaderboardOptIn: event.target.checked })
            }
          />
          <span className="text-sm font-medium">Opt in to global leaderboard visibility</span>
        </label>

        <div className="space-y-3 rounded-md border border-borderSoft bg-base p-4">
          <p className="text-sm font-medium">Consent</p>
          <ConsentCheckbox
            checked={form.consent.termsAccepted}
            label="Terms accepted"
            onChange={(checked) =>
              setForm({ ...form, consent: { ...form.consent, termsAccepted: checked } })
            }
          />
          <ConsentCheckbox
            checked={form.consent.privacyAccepted}
            label="Privacy accepted"
            onChange={(checked) =>
              setForm({ ...form, consent: { ...form.consent, privacyAccepted: checked } })
            }
          />
          <ConsentCheckbox
            checked={form.consent.marketing}
            label="Marketing updates"
            onChange={(checked) =>
              setForm({ ...form, consent: { ...form.consent, marketing: checked } })
            }
          />
        </div>

        <Button
          className="w-full"
          disabled={!profile || saving}
          type="submit"
        >
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </form>

      {message ? (
        <div className="mt-4 rounded-md border border-borderSoft bg-softSky px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}
    </Card>
  );
}

function ConsentCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <input
        className="rounded border-borderSoft text-worldCupBlue focus:ring-worldCupBlue"
        checked={checked}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-sm text-secondaryText">{label}</span>
    </label>
  );
}

function getEmptyForm(): FormState {
  return {
    locale: "en-US",
    countryCode: "",
    favoriteTeamIds: "",
    followedTeamIds: "",
    globalLeaderboardOptIn: false,
    consent: {
      termsAccepted: false,
      privacyAccepted: false,
      marketing: false,
    },
  };
}

function parseTeamIds(value: string) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeCountryCode(value: string) {
  const countryCode = value.trim().toUpperCase();

  return countryCode || null;
}
