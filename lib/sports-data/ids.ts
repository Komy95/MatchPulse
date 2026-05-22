export function deterministicSportsDocumentId(parts: string[]) {
  const normalized = parts
    .map((part) => normalizeIdPart(part))
    .filter(Boolean)
    .join("-");

  if (!normalized) {
    throw new Error("Cannot build deterministic ID from empty parts.");
  }

  return normalized.slice(0, 180);
}

export function normalizeIdPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deterministicProviderEntityId({
  providerId,
  externalId,
  fallbackParts,
}: {
  providerId: string;
  externalId?: string | null;
  fallbackParts: string[];
}) {
  return deterministicSportsDocumentId([
    providerId,
    externalId && externalId.trim() ? externalId : fallbackParts.join("-"),
  ]);
}
