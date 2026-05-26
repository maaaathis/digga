import type { Metadata } from "next";

import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/data";

export function siteUrl(): string {
  return process.env.SITE_URL ?? "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  noIndex,
}: {
  title: string;
  description?: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex ? "noindex, nofollow" : "index, follow",
  };
}

export function rootMetadata(): Metadata {
  return buildMetadata({
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    path: "/",
  });
}
