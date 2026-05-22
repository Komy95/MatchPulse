import type { DecodedIdToken } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

export async function upsertUserProfileFromDecodedToken(decodedToken: DecodedIdToken) {
  const profileRef = getFirebaseAdminFirestore().collection("users").doc(decodedToken.uid);
  const profileSnap = await profileRef.get();
  const authProfile = {
    displayName: decodedToken.name ?? null,
    email: decodedToken.email ?? null,
    photoUrl: decodedToken.picture ?? null,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (profileSnap.exists) {
    await profileRef.set(authProfile, { merge: true });
    return;
  }

  await profileRef.set({
    ...authProfile,
    locale: "en-US",
    countryCode: null,
    favoriteTeamIds: [],
    followedTeamIds: [],
    globalLeaderboardOptIn: false,
    consent: {
      termsAccepted: false,
      privacyAccepted: false,
      marketing: false,
    },
    createdAt: FieldValue.serverTimestamp(),
  });
}
