import type { Timestamp } from "firebase/firestore";

export type UserConsent = {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketing: boolean;
};

export type UserProfile = {
  displayName: string | null;
  email: string | null;
  photoUrl: string | null;
  locale: string;
  countryCode: string | null;
  favoriteTeamIds: string[];
  followedTeamIds: string[];
  globalLeaderboardOptIn: boolean;
  consent: UserConsent;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserProfileUpdateInput = Pick<
  UserProfile,
  | "locale"
  | "countryCode"
  | "favoriteTeamIds"
  | "followedTeamIds"
  | "globalLeaderboardOptIn"
  | "consent"
>;
