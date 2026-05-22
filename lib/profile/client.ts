"use client";

import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseClientFirestore } from "@/lib/firebase/client";
import type { UserProfileUpdateInput } from "@/lib/profile/types";

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
