'use client';

import { Building2, Clock, Compass, ExternalLink, MapPin, Server, Wifi } from 'lucide-react';
import { type FC, type ReactNode, useEffect, useState } from 'react';

import { fetchIpDetails, type IpDetailsResult } from '@/app/actions/ip';
import CopyButton from '@/components/copy-button';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';
import { detectHostingProvider, type HostingProvider } from '@/lib/hosting-provider';
import type { IpDetails } from '@/lib/ip';

type IpDetailsModalProps = {
	ip: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const IpDetailsModal: FC<IpDetailsModalProps> = ({ ip, open, onOpenChange }) => {
	const isDesktop = useMediaQuery('(min-width: 640px)');
	const [loaded, setLoaded] = useState<{ ip: string; result: IpDetailsResult } | null>(null);

	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		void fetchIpDetails(ip).then(next => {
			if (!cancelled) setLoaded({ ip, result: next });
		});
		return () => {
			cancelled = true;
		};
	}, [open, ip]);

	// Only treat data as ready when it belongs to the current IP, so we show a
	// loading state on open without a synchronous reset in the effect.
	const result = loaded && loaded.ip === ip ? loaded.result : null;

	const title = (
		<span className="flex items-center gap-2 font-mono text-base">
			<span>{ip}</span>
			<CopyButton value={ip} />
		</span>
	);
	const description = 'IP, network, and geolocation details';
	const body = <Body result={result} />;

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle asChild>
							<div>{title}</div>
						</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</DialogHeader>
					{body}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle asChild>
						<div>{title}</div>
					</DrawerTitle>
					<DrawerDescription>{description}</DrawerDescription>
				</DrawerHeader>
				<div className="px-4 pb-6">{body}</div>
			</DrawerContent>
		</Drawer>
	);
};

const Body: FC<{ result: IpDetailsResult | null }> = ({ result }) => {
	if (!result) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<Skeleton key={index} className="h-10 w-full rounded-lg" />
				))}
			</div>
		);
	}

	if (result.kind === 'ok') {
		return <DetailsView details={result.details} />;
	}

	return (
		<p className="text-muted-foreground py-6 text-center text-sm">
			{result.kind === 'rate-limited'
				? 'Rate limit reached. Try again shortly.'
				: result.kind === 'forbidden'
					? 'This endpoint is not available for automated traffic.'
					: result.kind === 'invalid'
						? 'Not a valid IP.'
						: 'Lookup failed. Try again later.'}
		</p>
	);
};

/** SVG country flag (works everywhere, unlike emoji flags on Windows). */
const Flag: FC<{ code: string }> = ({ code }) => {
	const [error, setError] = useState(false);
	if (!/^[a-z]{2}$/i.test(code) || error) return null;
	return (
		// Remote SVG flag with an onError fallback; next/image adds no value here.
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
			alt=""
			width={20}
			height={15}
			loading="lazy"
			decoding="async"
			onError={() => setError(true)}
			className="ring-border/60 h-[15px] w-5 shrink-0 rounded-[3px] object-cover ring-1"
			draggable={false}
		/>
	);
};

/** Hosting provider logo when the network is recognized, otherwise a generic icon. */
const NetworkLogo: FC<{ provider: HostingProvider | null }> = ({ provider }) => {
	const [error, setError] = useState(false);

	if (provider && !error) {
		return (
			<span className="bg-background border-border/60 flex size-9 shrink-0 items-center justify-center rounded-lg border p-1.5">
				{/* Provider favicon as logo, matching ProviderBadge. */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={`https://icons.duckduckgo.com/ip3/${provider.domain}.ico`}
					alt=""
					width={24}
					height={24}
					loading="lazy"
					decoding="async"
					onError={() => setError(true)}
					className="size-full object-contain"
					draggable={false}
				/>
			</span>
		);
	}

	return (
		<span className="bg-background border-border/60 text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border">
			<Building2 className="size-4" />
		</span>
	);
};

const Section: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
	<div>
		<p className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wider uppercase">
			{title}
		</p>
		<dl className="border-border/60 divide-border/50 divide-y rounded-xl border">{children}</dl>
	</div>
);

const Row: FC<{ icon: ReactNode; label: string; children: ReactNode }> = ({
	icon,
	label,
	children,
}) => (
	<div className="flex items-start justify-between gap-4 px-3 py-2.5">
		<dt className="text-muted-foreground flex shrink-0 items-center gap-2 text-xs">
			{icon}
			{label}
		</dt>
		<dd className="text-foreground min-w-0 text-right text-sm break-words">{children}</dd>
	</div>
);

const DetailsView: FC<{ details: IpDetails }> = ({ details }) => {
	const place = [details.country, details.regionName, details.city].filter(Boolean).join(', ');
	const hasCoords = typeof details.lat === 'number' && typeof details.lon === 'number';
	const mapUrl = hasCoords
		? `https://www.openstreetmap.org/?mlat=${details.lat}&mlon=${details.lon}#map=11/${details.lat}/${details.lon}`
		: null;
	const showIsp = Boolean(details.isp) && details.isp !== details.org;
	const provider = detectHostingProvider(
		[details.org, details.isp, details.as].filter(Boolean).join(' '),
	);

	return (
		<div className="space-y-5">
			<div className="border-border/60 bg-muted/30 flex items-center gap-3 rounded-xl border p-4">
				<NetworkLogo provider={provider} />
				<div className="min-w-0 flex-1">
					<p className="text-foreground truncate text-sm font-medium">
						{details.org || details.isp || 'Unknown network'}
					</p>
					{details.as ? (
						<Badge variant="secondary" className="mt-1 font-mono text-[11px] font-normal">
							{details.as}
						</Badge>
					) : null}
				</div>
			</div>

			<Section title="Network">
				<Row icon={<Server className="size-3.5" />} label="Reverse">
					{details.reverse ? (
						<span className="flex items-center justify-end gap-1 font-mono">
							<span className="break-all">{details.reverse}</span>
							<CopyButton value={details.reverse} />
						</span>
					) : (
						<span className="text-muted-foreground italic">not configured</span>
					)}
				</Row>
				{showIsp ? (
					<Row icon={<Wifi className="size-3.5" />} label="ISP">
						{details.isp}
					</Row>
				) : null}
			</Section>

			<Section title="Location">
				<Row icon={<MapPin className="size-3.5" />} label="Place">
					<span className="flex items-center justify-end gap-1.5">
						<Flag code={details.countryCode} />
						<span>{place || 'n/a'}</span>
					</span>
				</Row>
				{details.timezone ? (
					<Row icon={<Clock className="size-3.5" />} label="Timezone">
						<span className="font-mono">{details.timezone}</span>
					</Row>
				) : null}
				{hasCoords && mapUrl ? (
					<Row icon={<Compass className="size-3.5" />} label="Coordinates">
						<a
							href={mapUrl}
							target="_blank"
							rel="noreferrer noopener"
							className="hover:text-foreground inline-flex items-center gap-1 font-mono underline-offset-2 hover:underline"
						>
							{details.lat}, {details.lon}
							<ExternalLink className="size-3 opacity-60" />
						</a>
					</Row>
				) : null}
			</Section>
		</div>
	);
};

export default IpDetailsModal;
