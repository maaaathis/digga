"use server";

import { headers } from "next/headers";

import { inspectUserAgent } from "@/lib/bot";
import { getIpDetails, type IpDetails } from "@/lib/ip";
import { consumeToken, ipFromHeaders, sweepBuckets } from "@/lib/rate-limit";

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6 = /^[0-9a-fA-F:]+$/;

export type IpDetailsResult =
  | { kind: "ok"; details: IpDetails }
  | { kind: "forbidden" }
  | { kind: "rate-limited" }
  | { kind: "invalid" }
  | { kind: "error"; message: string };

export async function fetchIpDetails(ip: string): Promise<IpDetailsResult> {
  if (!ip || (!IPV4.test(ip) && !IPV6.test(ip))) {
    return { kind: "invalid" };
  }

  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent");
  const inspection = inspectUserAgent(userAgent);
  if (inspection.isBot && !inspection.isAllowed) {
    return { kind: "forbidden" };
  }

  sweepBuckets();
  const requester = ipFromHeaders(headerStore);
  const limit = consumeToken(`ip:${requester}`, {
    capacity: 30,
    refillPerSecond: 1,
  });
  if (!limit.allowed) {
    return { kind: "rate-limited" };
  }

  try {
    const details = await getIpDetails(ip);
    return { kind: "ok", details };
  } catch (error) {
    return {
      kind: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
