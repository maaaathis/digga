"use client";

import { ScrollText, Sparkles } from "lucide-react";
import { type FC, type ReactNode, useState } from "react";

import SegmentedTabs from "@/components/lookup/segmented-tabs";

type WhoisTabsProps = {
  defaultValue: "rdap" | "whois";
  hasRdap: boolean;
  hasWhois: boolean;
  rdapPanel: ReactNode;
  whoisPanel: ReactNode;
};

const WhoisTabs: FC<WhoisTabsProps> = ({
  defaultValue,
  hasRdap,
  hasWhois,
  rdapPanel,
  whoisPanel,
}) => {
  const [value, setValue] = useState<"rdap" | "whois">(defaultValue);

  return (
    <div className="space-y-6">
      <SegmentedTabs
        ariaLabel="Registration data source"
        value={value}
        onChange={setValue}
        options={[
          {
            value: "rdap",
            label: (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                RDAP
              </span>
            ),
            disabled: !hasRdap,
          },
          {
            value: "whois",
            label: (
              <span className="inline-flex items-center gap-1.5">
                <ScrollText className="size-3.5" />
                WHOIS
              </span>
            ),
            disabled: !hasWhois,
          },
        ]}
      />
      <div hidden={value !== "rdap"}>{rdapPanel}</div>
      <div hidden={value !== "whois"}>{whoisPanel}</div>
    </div>
  );
};

export default WhoisTabs;
