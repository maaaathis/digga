"use client";

import {
  Building2,
  Compass,
  Globe2,
  MapPin,
  Network,
  Server,
  Wifi,
} from "lucide-react";
import { type FC, type ReactNode, useEffect, useState } from "react";

import { fetchIpDetails, type IpDetailsResult } from "@/app/actions/ip";
import CopyButton from "@/components/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { IpDetails } from "@/lib/ip";

type IpDetailsModalProps = {
  ip: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const IpDetailsModal: FC<IpDetailsModalProps> = ({ ip, open, onOpenChange }) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [result, setResult] = useState<IpDetailsResult | null>(null);

  useEffect(() => {
    if (!open) {
      setResult(null);
      return;
    }
    let cancelled = false;
    void fetchIpDetails(ip).then((next) => {
      if (!cancelled) setResult(next);
    });
    return () => {
      cancelled = true;
    };
  }, [open, ip]);

  const title = (
    <span className="flex items-center gap-2 font-mono text-base">
      <span>{ip}</span>
      <CopyButton value={ip} />
    </span>
  );
  const description = "IP, network, and geolocation details";
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

  if (result.kind === "ok") {
    return <DetailsView details={result.details} />;
  }

  return (
    <p className="text-muted-foreground py-6 text-center text-sm">
      {result.kind === "rate-limited"
        ? "Rate limit reached. Try again shortly."
        : result.kind === "forbidden"
          ? "This endpoint is not available for automated traffic."
          : result.kind === "invalid"
            ? "Not a valid IP."
            : "Lookup failed. Try again later."}
    </p>
  );
};

const DetailsView: FC<{ details: IpDetails }> = ({ details }) => {
  const rows: { icon: ReactNode; label: string; value: ReactNode }[] = [
    {
      icon: <Network className="size-3.5" />,
      label: "IP",
      value: <span className="font-mono">{details.query}</span>,
    },
    {
      icon: <Server className="size-3.5" />,
      label: "Reverse",
      value:
        details.reverse ?? (
          <span className="text-muted-foreground italic">not configured</span>
        ),
    },
    {
      icon: <Building2 className="size-3.5" />,
      label: "Organization",
      value: details.org || "n/a",
    },
    {
      icon: <Wifi className="size-3.5" />,
      label: "ISP",
      value: details.isp || "n/a",
    },
    {
      icon: <Globe2 className="size-3.5" />,
      label: "ASN",
      value: <span className="font-mono">{details.as || "n/a"}</span>,
    },
    {
      icon: <MapPin className="size-3.5" />,
      label: "Location",
      value: [details.country, details.regionName, details.city]
        .filter(Boolean)
        .join(", "),
    },
    {
      icon: <Compass className="size-3.5" />,
      label: "Coordinates",
      value:
        typeof details.lat === "number" && typeof details.lon === "number"
          ? `Latitude: ${details.lat}, Longitude: ${details.lon}`
          : "n/a",
    },
    {
      icon: <Globe2 className="size-3.5" />,
      label: "Timezone",
      value: details.timezone || "n/a",
    },
  ];

  return (
    <dl className="space-y-2 text-sm">
      {rows.map((row) => (
        <div
          key={row.label}
          className="bg-muted/40 flex items-start justify-between gap-4 rounded-lg px-3 py-2.5"
        >
          <dt className="text-muted-foreground flex items-center gap-2 text-xs">
            {row.icon}
            {row.label}
          </dt>
          <dd className="text-foreground text-right text-sm break-words">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default IpDetailsModal;
