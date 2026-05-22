import { NextResponse } from "next/server";
import { requireAuthenticatedUserContext } from "@/lib/auth/user-context";
import { apiErrorResponse, ApiError } from "@/lib/api/errors";
import { createGroup, listUserGroups } from "@/lib/groups/service";
import { createGroupSchema } from "@/lib/groups/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireAuthenticatedUserContext();
    const groups = await listUserGroups(user.uid);

    return NextResponse.json({ groups });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUserContext();
    const body = createGroupSchema.parse(await request.json().catch(() => null));

    if (!body.name) {
      throw new ApiError("GROUP_NAME_INVALID", "Group name is required.");
    }

    const group = await createGroup(body, user);

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
