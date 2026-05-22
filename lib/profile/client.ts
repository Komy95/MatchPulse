"use client";

import type { User } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseClientFirestore } from "@/lib/firebase/client";
import type { UserProfileUpdateInput } from "@/lib/profile/types";

export async function bootstrapUserProfile(user: User) {
  const firestore = getFirebaseClientFirestore();
  const profileRef = doc(firestore, "users", user.uid);
  const profileSnap = await getDoc(profileRef);
  const authProfile = {
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    photoUrl: user.photoURL ?? null,
    updatedAt: serverTimestamp(),
  };

  if (profileSnap.exists()) {
    await updateDoc(profileRef, authProfile);
    return;
  }

  await setDoc(profileRef, {
    ...authProfile,
    locale: navigator.language || "en-US",
    countryCode: null,
    favoriteTeamIds: [],
    followedTeamIds: [],
    globalLeaderboardOptIn: false,
    consent: {
      termsAccepted: false,
      privacyAccepted: false,
      marketing: false,
    },
    createdAt: serverTimestamp(),
  });
}

export async function updateUserProfile(uid: string, input: UserProfileUpdateInput) {
  const firestore = getFirebaseClientFirestore();
  const profileRef = doc(firestore, "users", uid);

  await updateDoc(profileRef, {
    locale: input.locale,
    countryCode: input.countryCode,
    favoriteTeamIds: input.favoriteTeamIds,
    followedTeamIds: input.followedTeamIds,
    globalLeaderboardOptIn: input.globalLeaderboardOptIn,
    consent: input.consent,
    updatedAt: serverTimestamp(),
  });
}
