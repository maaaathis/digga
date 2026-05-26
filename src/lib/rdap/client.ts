import "server-only";

import { getBaseDomain, getTLD, isValidLookupDomain } from "@/lib/domain";

import { getRdapServersForTld } from "./bootstrap";
import { normalizeRdap } from "./normalize";
import type { NormalizedRdap, RdapDomain } from "./types";

const FETCH_TIMEOUT_MS = 5_000;

export type RdapLookupResult =
  | { kind: "ok"; data: NormalizedRdap }
  | { kind: "unsupported"; reason: "no-rdap-server" }
  | { kind: "not-found" }
  | { kind: "error"; status?: number; message: string };

export async function lookupRdap(input: string): Promise<RdapLookupResult> {
  const base = getBaseDomain(input);
  if (!base || !isValidLookupDomain(base)) {
    return { kind: "error", message: "Invalid domain" };
  }
  const tld = getTLD(base);
  if (!tld) return { kind: "unsupported", reason: "no-rdap-server" };

  let servers: string[] | null;
  try {
    servers = await getRdapServersForTld(tld);
  } catch (error) {
    console.error("RDAP bootstrap failed:", error);
    return { kind: "error", message: "RDAP bootstrap fetch failed" };
  }

  if (!servers || servers.length === 0) {
    return { kind: "unsupported", reason: "no-rdap-server" };
  }

  for (const server of servers) {
    const url = `${server}/domain/${encodeURIComponent(base)}`;
    try {
      const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);

      if (response.status === 404) {
        return { kind: "not-found" };
      }
      if (!response.ok) {
        console.warn(`RDAP ${server} returned ${response.status} for ${base}`);
        continue;
      }

      const data = (await response.json()) as RdapDomain;
      if (data.errorCode === 404) return { kind: "not-found" };

      return { kind: "ok", data: normalizeRdap(base, server, data) };
    } catch (error) {
      console.warn(`RDAP ${server} fetch failed for ${base}:`, error);
      continue;
    }
  }

  return { kind: "error", message: "All RDAP servers failed" };
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/rdap+json, application/json" },
      next: { revalidate: 600 },
    });
  } finally {
    clearTimeout(timeout);
  }
}
