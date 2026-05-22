import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/errors";
import { requireAuthenticatedUserContext } from "@/lib/auth/user-context";
import { upsertPredictions } from "@/lib/predictions/service";
import { bulkPredictionSchema } from "@/lib/predictions/validation";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string; groupSeasonId: string }> },
) {
  try {
    const user = await requireAuthenticatedUserContext();
    const { groupId, groupSeasonId } = await params;
    const body = bulkPredictionSchema.parse(await request.json().catch(() => null));
    const result = await upsertPredictions({
      groupId,
      groupSeasonId,
      user,
      input: body,
    });

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
