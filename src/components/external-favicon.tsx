"use client";

import { type FC, useState } from "react";
import useSWR from "swr";

import { hasFavicon } from "@/app/actions/favicon";
import { cn } from "@/lib/utils";

type ExternalFaviconProps = {
  url: string;
  size?: number;
  className?: string;
};

const ExternalFavicon: FC<ExternalFaviconProps> = ({
  url,
  size = 32,
  className,
}) => {
  const [imageError, setImageError] = useState(false);

  const { data: hasIcon } = useSWR(
    ["favicon-check", url],
    () => hasFavicon(url),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60 * 60 * 1000,
    },
  );

  if (imageError || hasIcon === false) return null;

  return (
    <img
      src={`https://icons.duckduckgo.com/ip3/${encodeURIComponent(url)}.ico`}
      alt={`Favicon for ${url}`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setImageError(true)}
      className={cn("shrink-0 rounded-md", className)}
      style={{ width: size, height: size }}
    />
  );
};

export default ExternalFavicon;
