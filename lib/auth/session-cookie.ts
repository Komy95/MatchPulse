const sessionCookieName = "__session";
const sessionMaxAgeSeconds = 60 * 60;

export function setSessionCookie(token: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = [
    `${sessionCookieName}=${token}`,
    "path=/",
    `max-age=${sessionMaxAgeSeconds}`,
    "SameSite=Lax",
    window.location.protocol === "https:" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearSessionCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${sessionCookieName}=; path=/; max-age=0; SameSite=Lax`;
}
