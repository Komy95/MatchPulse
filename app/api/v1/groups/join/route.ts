import { NextResponse } from "next/server";
import { requireAuthenticatedUserContext } from "@/lib/auth/user-context";
import { apiErrorResponse } from "@/lib/api/errors";
import { joinGroupByInvite } from "@/lib/groups/service";
import { joinGroupSchema } from "@/lib/groups/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUserContext();
    const body = joinGroupSchema.parse(await request.json().catch(() => null));
    const membership = await joinGroupByInvite(body.code, user);

    return NextResponse.json({ membership });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
