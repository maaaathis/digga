import { isbot } from "isbot";

export type BotInspection = {
  isBot: boolean;
  isAllowed: boolean;
  userAgent: string | null;
};

function readAllowedList(): string[] {
  if (!process.env.ALLOWED_BOTS) return [];
  try {
    const parsed = JSON.parse(process.env.ALLOWED_BOTS) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

const ALLOWED = readAllowedList();

export function inspectUserAgent(
  userAgent: string | null | undefined,
): BotInspection {
  const ua = userAgent ?? null;
  const bot = !ua || isbot(ua);
  const isAllowed = bot
    ? Boolean(ua) &&
      ALLOWED.some((entry) => ua!.toLowerCase().includes(entry.toLowerCase()))
    : true;
  return { isBot: bot, isAllowed, userAgent: ua };
}

export function isAllowedRequest(userAgent: string | null | undefined): boolean {
  return inspectUserAgent(userAgent).isAllowed;
}
