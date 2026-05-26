import { CircleHelp } from "lucide-react";
import type { FC } from "react";

type DomainNotRegisteredProps = {
  domain: string;
};

const DomainNotRegistered: FC<DomainNotRegisteredProps> = ({ domain }) => (
  <div className="bg-card border-border/60 mx-auto mt-12 max-w-xl rounded-2xl border p-8 text-center shadow-sm">
    <div className="bg-muted text-muted-foreground mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl">
      <CircleHelp className="size-6" />
    </div>
    <h2 className="text-foreground text-xl font-semibold tracking-tight">
      Looks unregistered
    </h2>
    <p className="text-muted-foreground mt-2 text-sm">
      WHOIS says <span className="text-foreground font-mono">{domain}</span> is
      currently available. There is nothing to dig up.
    </p>
  </div>
);

export default DomainNotRegistered;
