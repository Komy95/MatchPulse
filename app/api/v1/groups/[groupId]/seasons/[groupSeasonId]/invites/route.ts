import { NextResponse } from "next/server";
import { requireAuthenticatedUserContext } from "@/lib/auth/user-context";
import { apiErrorResponse } from "@/lib/api/errors";
import { createGroupSeasonInvite } from "@/lib/groups/service";
import { createInviteSchema } from "@/lib/groups/validation";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string; groupSeasonId: string }> },
) {
  try {
    const user = await requireAuthenticatedUserContext();
    createInviteSchema.parse(await request.json().catch(() => ({})));
    const { groupId, groupSeasonId } = await params;
    const invite = await createGroupSeasonInvite(groupId, groupSeasonId, user);

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
