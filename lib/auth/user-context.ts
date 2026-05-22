import { cookies, headers } from "next/headers";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

export type AuthenticatedUserContext = {
  uid: string;
  email?: string;
  displayName?: string;
};

export async function getAuthenticatedUserContext(): Promise<AuthenticatedUserContext | null> {
  const token = await getRequestToken();

  if (!token) {
    return null;
  }

  try {
    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
    };
  } catch {
    return null;
  }
}

async function getRequestToken() {
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  const cookieStore = await cookies();
  return cookieStore.get("__session")?.value ?? null;
}
