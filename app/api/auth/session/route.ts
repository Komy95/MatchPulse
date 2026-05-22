import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertUserProfileFromDecodedToken } from "@/lib/profile/server";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import {
  sessionCookieMaxAgeSeconds,
  setSessionCookie,
} from "@/lib/auth/session";

export const runtime = "nodejs";

const sessionRequestSchema = z.object({
  idToken: z.string().min(1),
});

export async function POST(request: Request) {
  const parsedBody = sessionRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid session request." }, { status: 400 });
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decodedToken = await auth.verifyIdToken(parsedBody.data.idToken);
    const sessionCookie = await auth.createSessionCookie(parsedBody.data.idToken, {
      expiresIn: sessionCookieMaxAgeSeconds * 1000,
    });

    await upsertUserProfileFromDecodedToken(decodedToken);

    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, sessionCookie);

    return response;
  } catch {
    return NextResponse.json({ error: "Unable to create session." }, { status: 401 });
  }
}
