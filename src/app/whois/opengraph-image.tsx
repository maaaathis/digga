import { ogImageContentType, ogImageSize, renderToolOgImage } from '@/lib/og-image';
import { TOOLS } from '@/lib/tools';

const tool = TOOLS.whois;

export const alt = `${tool.name} · digga`;
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OgImage() {
	return renderToolOgImage(tool.name, tool.eyebrow);
}
