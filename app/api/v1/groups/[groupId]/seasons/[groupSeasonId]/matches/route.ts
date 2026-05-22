import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/errors";
import { requireAuthenticatedUserContext } from "@/lib/auth/user-context";
import { listGroupSeasonMatchesWithPredictions } from "@/lib/predictions/service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string; groupSeasonId: string }> },
) {
  try {
    const user = await requireAuthenticatedUserContext();
    const { groupId, groupSeasonId } = await params;
    const matches = await listGroupSeasonMatchesWithPredictions({
      groupId,
      groupSeasonId,
      userId: user.uid,
    });

    return NextResponse.json(matches);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
