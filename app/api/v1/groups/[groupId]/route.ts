import { NextResponse } from "next/server";
import { requireAuthenticatedUserContext } from "@/lib/auth/user-context";
import { apiErrorResponse } from "@/lib/api/errors";
import { getGroupDetail } from "@/lib/groups/service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  try {
    const user = await requireAuthenticatedUserContext();
    const { groupId } = await params;
    const group = await getGroupDetail(groupId, user.uid);

    return NextResponse.json({ group });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
