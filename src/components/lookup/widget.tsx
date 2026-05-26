import type { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

type WidgetProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  action?: ReactNode;
  variant?: "card" | "section";
};

const Widget: FC<WidgetProps> = ({
  title,
  subtitle,
  icon,
  className,
  children,
  action,
  variant = "card",
}) => {
  if (variant === "section") {
    return (
      <section className={cn("py-2", className)}>
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {icon ? (
              <span className="text-muted-foreground inline-flex size-7 items-center justify-center">
                {icon}
              </span>
            ) : null}
            <div>
              <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                {title}
              </h3>
              {subtitle ? (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          {action}
        </header>
        {children}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "border-border/60 bg-card/60 rounded-2xl border p-5",
        className,
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon ? (
            <span className="bg-muted text-foreground flex size-7 items-center justify-center rounded-lg">
              {icon}
            </span>
          ) : null}
          <div>
            <h3 className="text-foreground text-sm font-semibold">{title}</h3>
            {subtitle ? (
              <p className="text-muted-foreground text-xs">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {action ? <div>{action}</div> : null}
      </header>
      {children}
    </section>
  );
};

export default Widget;
