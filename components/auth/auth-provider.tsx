"use client";

import { onIdTokenChanged, type User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getFirebaseClientAuth } from "@/lib/firebase/client";
import { bootstrapUserProfile } from "@/lib/profile/client";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session-cookie";

type AuthState = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(getFirebaseClientAuth(), async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        clearSessionCookie();
        setLoading(false);
        return;
      }

      const token = await nextUser.getIdToken();
      setSessionCookie(token);
      await bootstrapUserProfile(nextUser);
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
