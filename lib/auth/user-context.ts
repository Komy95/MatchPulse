import { cookies, headers } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { sessionCookieName } from "@/lib/auth/session";

export type AuthenticatedUserContext = {
  uid: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
};

export class UnauthorizedError extends Error {
  constructor(message = "Authentication is required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function getAuthenticatedUserContext(): Promise<AuthenticatedUserContext | null> {
  const credential = await getRequestCredential();

  if (!credential) {
    return null;
  }

  try {
    const decodedToken =
      credential.type === "bearer"
        ? await getFirebaseAdminAuth().verifyIdToken(credential.token)
        : await getFirebaseAdminAuth().verifySessionCookie(credential.token, true);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoUrl: decodedToken.picture,
    };
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUserContext(): Promise<AuthenticatedUserContext> {
  const user = await getAuthenticatedUserContext();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

async function getRequestCredential() {
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return {
      type: "bearer" as const,
      token: authorization.slice("Bearer ".length).trim(),
    };
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(sessionCookieName)?.value;

  return sessionCookie
    ? {
        type: "session" as const,
        token: sessionCookie,
      }
    : null;
}
