"use client";

import type { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SegmentedTabOption<T extends string> = {
  value: T;
  label: ReactNode;
  disabled?: boolean;
};

type SegmentedTabsProps<T extends string> = {
  options: SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
};

function SegmentedTabsInner<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "bg-muted/40 ring-border/60 inline-flex rounded-xl p-1 ring-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            type="button"
            disabled={option.disabled}
            onClick={() => !option.disabled && onChange(option.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              option.disabled && "cursor-not-allowed opacity-50 hover:text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const SegmentedTabs = SegmentedTabsInner as <T extends string>(
  props: SegmentedTabsProps<T>,
) => ReturnType<FC>;

export default SegmentedTabs;
