"use server";

import { isValidLookupDomain, normalizeDomain } from "@/lib/domain";

const PLACEHOLDER_HASH =
  "e5db88ea2322863ca17817b99d60006c625a31cff0dad49cf05d3c6d16a75c17";
const PLACEHOLDER_SIZE = 1478;
const REVALIDATE_SECONDS = 60 * 60 * 24 * 7;

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hasFavicon(input: string): Promise<boolean> {
  const domain = normalizeDomain(input);
  if (!isValidLookupDomain(domain)) return false;

  try {
    const response = await fetch(
      `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!response.ok) return false;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength !== PLACEHOLDER_SIZE) return true;

    const hash = await sha256Hex(buffer);
    return hash !== PLACEHOLDER_HASH;
  } catch {
    return false;
  }
}
