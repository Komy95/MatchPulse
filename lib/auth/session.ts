import { NextResponse } from "next/server";

export const sessionCookieName = "__session";
export const sessionCookieMaxAgeSeconds = 60 * 60 * 24 * 5;

export function setSessionCookie(response: NextResponse, sessionCookie: string) {
  response.cookies.set({
    name: sessionCookieName,
    value: sessionCookie,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionCookieMaxAgeSeconds,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: sessionCookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
