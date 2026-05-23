import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { recalculateGroupSeasonLeaderboardSystem } from "@/lib/leaderboard/service";
import { eventBus } from "@/lib/events";
import type { GroupSeasonDocument } from "@/lib/groups/types";

let initialized = false;

export function initializeEventSubscribers() {
  if (initialized) {
    return;
  }

  initialized = true;

  eventBus.on("match-finished", async ({ competitionId, seasonId }) => {
    try {
      const firestore = getFirebaseAdminFirestore();
      const groupSeasonsSnap = await firestore
        .collectionGroup("seasons")
        .where("competitionId", "==", competitionId)
        .get();

      await Promise.all(
        groupSeasonsSnap.docs
          .filter((doc) => {
            const groupSeason = doc.data() as Partial<GroupSeasonDocument>;

            return groupSeason.seasonId === seasonId && groupSeason.status === "ACTIVE";
          })
          .map((doc) => {
            const groupRef = doc.ref.parent.parent;

            if (!groupRef) {
              return Promise.resolve();
            }

            return recalculateGroupSeasonLeaderboardSystem({
              groupId: groupRef.id,
              groupSeasonId: doc.id,
              generatedBy: "SYSTEM_EVENT",
            });
          }),
      );
    } catch (error) {
      console.error("match-finished subscriber failed", error);
    }
  });
}
