import {
  ogImageAlt,
  ogImageContentType,
  ogImageSize,
  renderDomainOgImage,
} from "@/lib/og-image";

export const alt = ogImageAlt;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function OgImage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  return renderDomainOgImage(domain);
}
