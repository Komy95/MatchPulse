import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/errors";
import { requireAuthenticatedUserContext } from "@/lib/auth/user-context";
import { recalculateGroupSeasonLeaderboard } from "@/lib/leaderboard/service";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ groupId: string; groupSeasonId: string }> },
) {
  try {
    const user = await requireAuthenticatedUserContext();
    const { groupId, groupSeasonId } = await params;
    const result = await recalculateGroupSeasonLeaderboard({
      groupId,
      groupSeasonId,
      userId: user.uid,
    });

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
