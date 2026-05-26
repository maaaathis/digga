"use client";

import type { FC } from "react";

import SegmentedTabs from "@/components/lookup/segmented-tabs";
import { type ResolverId, RESOLVERS } from "@/lib/dns/types";

type ResolverTabsProps = {
  value: ResolverId;
  onChange: (value: ResolverId) => void;
};

const ResolverTabs: FC<ResolverTabsProps> = ({ value, onChange }) => (
  <SegmentedTabs
    ariaLabel="DNS resolver"
    value={value}
    onChange={onChange}
    options={RESOLVERS.map((resolver) => ({
      value: resolver.id,
      label: resolver.label,
    }))}
  />
);

export default ResolverTabs;
