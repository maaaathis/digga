import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function deduplicate<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function isAppleDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Mac|iPad|iPhone|iPod/.test(window.navigator.userAgent);
}

export const IPV4_REGEX = /(\d{1,3}\.){3}\d{1,3}/g;
export const IPV6_REGEX =
  /(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|:(?::[0-9A-Fa-f]{1,4}){1,7}|::/g;

export function maskIpLastOctet(ip: string | null): string | null {
  if (!ip) return null;
  const trimmed = ip.trim();
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4.test(trimmed)) return null;
  const octets = trimmed.split(".").map(Number);
  if (octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) return null;
  return `${octets[0]}.${octets[1]}.${octets[2]}.0`;
}

export function compareLengthThenAlpha(a: string, b: string): number {
  return a.length === b.length ? a.localeCompare(b) : a.length - b.length;
}
