import { SITE_NAME, SITE_TAGLINE } from '@/lib/data';
import { ogImageContentType, ogImageSize, renderHomeOgImage } from '@/lib/og-image';

export const alt = `${SITE_NAME} · ${SITE_TAGLINE}`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OgImage() {
	return renderHomeOgImage();
}
