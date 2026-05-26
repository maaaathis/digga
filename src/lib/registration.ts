import "server-only";

import { lookupRdap, type RdapLookupResult } from "@/lib/rdap/client";
import type { NormalizedRdap } from "@/lib/rdap/types";
import { lookupWhoisParsed } from "@/lib/whois";

export type RegistrationInfo = {
  source: "rdap" | "whois";
  domain: string;
  registrar?: string;
  registrarIanaId?: string;
  abuseEmail?: string;
  registrantName?: string;
  registrantOrg?: string;
  registrantCountry?: string;
  status: string[];
  nameservers: string[];
  dnssec: boolean | null;
  events: { action: string; date: string }[];
  rdap?: NormalizedRdap;
};

function unwrapWhois(parsed: Record<string, unknown>): Record<string, unknown> | null {
  for (const key of Object.keys(parsed)) {
    const block = parsed[key];
    if (block && typeof block === "object" && !Array.isArray(block)) {
      return block as Record<string, unknown>;
    }
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : typeof value === "string"
      ? [value]
      : [];
}

function parseWhoisEvents(block: Record<string, unknown>) {
  const events: { action: string; date: string }[] = [];
  const map: Record<string, string> = {
    "Created Date": "registration",
    "Creation Date": "registration",
    "Updated Date": "last changed",
    "Expiry Date": "expiration",
    "Expires Date": "expiration",
  };
  for (const [key, action] of Object.entries(map)) {
    const value = block[key];
    if (typeof value === "string" && value.length > 0) {
      events.push({ action, date: value });
    }
  }
  return events;
}

export async function getRegistrationInfo(
  domain: string,
): Promise<RegistrationInfo | null> {
  const rdapResult: RdapLookupResult = await lookupRdap(domain);

  if (rdapResult.kind === "ok") {
    const { data } = rdapResult;
    return {
      source: "rdap",
      domain: data.domain,
      registrar: data.registrar?.name,
      registrarIanaId: data.registrar?.ianaId,
      abuseEmail: data.registrar?.abuseEmail,
      registrantName: data.registrant?.name,
      registrantOrg: data.registrant?.organization,
      registrantCountry: data.registrant?.country,
      status: data.status,
      nameservers: data.nameservers,
      dnssec: data.dnssec,
      events: data.events,
      rdap: data,
    };
  }

  const parsed = await lookupWhoisParsed(domain);
  if (!parsed) return null;

  const block = unwrapWhois(parsed as Record<string, unknown>);
  if (!block) return null;

  return {
    source: "whois",
    domain,
    registrar:
      (block["Registrar"] as string | undefined) ??
      (block["Registrant Name"] as string | undefined),
    abuseEmail: block["Registrar Abuse Contact Email"] as string | undefined,
    registrantName: block["Registrant Name"] as string | undefined,
    registrantOrg: block["Registrant Organization"] as string | undefined,
    registrantCountry: block["Registrant Country"] as string | undefined,
    status: asStringArray(block["Domain Status"]),
    nameservers: asStringArray(block["Name Server"]).map((ns) => ns.toLowerCase()),
    dnssec:
      typeof block["DNSSEC"] === "string"
        ? (block["DNSSEC"] as string).toLowerCase().includes("signed")
        : null,
    events: parseWhoisEvents(block),
  };
}
