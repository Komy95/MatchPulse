import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { env } from "@/lib/env";

let emulatorConnected = false;

export function getFirebaseClientApp(): FirebaseApp {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  return initializeApp({
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

export function getFirebaseClientAuth(): Auth {
  const auth = getAuth(getFirebaseClientApp());

  connectClientEmulators(auth, getFirestore(getFirebaseClientApp()));

  return auth;
}

export function getFirebaseClientFirestore(): Firestore {
  const firestore = getFirestore(getFirebaseClientApp());

  connectClientEmulators(getAuth(getFirebaseClientApp()), firestore);

  return firestore;
}

function connectClientEmulators(auth: Auth, firestore: Firestore) {
  if (emulatorConnected || typeof window === "undefined") {
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    return;
  }

  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  emulatorConnected = true;
}
