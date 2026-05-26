import {
  Building2,
  CalendarClock,
  KeyRound,
  Server,
  ShieldCheck,
} from "lucide-react";
import type { FC } from "react";

import CopyButton from "@/components/copy-button";
import Widget from "@/components/lookup/widget";
import { Badge } from "@/components/ui/badge";
import type { RegistrationInfo } from "@/lib/registration";

type RegistrationProps = { registration: RegistrationInfo };

function formatDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export const DomainDatesWidget: FC<RegistrationProps> = ({ registration }) => {
  const interesting = registration.events.filter((event) =>
    ["registration", "expiration", "last changed", "transfer"].some((needle) =>
      event.action.toLowerCase().includes(needle),
    ),
  );
  if (interesting.length === 0) return null;

  return (
    <Widget
      variant="section"
      title="Important dates"
      icon={<CalendarClock className="size-3.5" />}
      subtitle={registration.source === "rdap" ? "via RDAP" : "via WHOIS"}
    >
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {interesting.map((event) => (
          <div
            key={`${event.action}-${event.date}`}
            className="bg-muted/40 rounded-lg p-3"
          >
            <dt className="text-muted-foreground text-xs capitalize">
              {event.action}
            </dt>
            <dd className="text-foreground mt-1 font-mono text-sm">
              {formatDate(event.date)}
            </dd>
          </div>
        ))}
      </dl>
    </Widget>
  );
};

export const RegistrantWidget: FC<RegistrationProps> = ({ registration }) => {
  const hasContent =
    registration.registrar ||
    registration.registrantName ||
    registration.registrantOrg ||
    registration.abuseEmail;
  if (!hasContent) return null;

  return (
    <Widget
      variant="section"
      title="Registration"
      icon={<Building2 className="size-3.5" />}
      subtitle={registration.source === "rdap" ? "via RDAP" : "via WHOIS"}
    >
      <dl className="space-y-3 text-sm">
        {registration.registrar ? (
          <div>
            <dt className="text-muted-foreground text-xs">Registrar</dt>
            <dd className="text-foreground mt-0.5 font-medium">
              {registration.registrar}
              {registration.registrarIanaId ? (
                <span className="text-muted-foreground ml-2 font-mono text-xs">
                  IANA {registration.registrarIanaId}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {registration.registrantOrg || registration.registrantName ? (
          <div>
            <dt className="text-muted-foreground text-xs">Registrant</dt>
            <dd className="text-foreground mt-0.5 font-medium">
              {registration.registrantOrg ?? registration.registrantName}
              {registration.registrantCountry ? (
                <span className="text-muted-foreground ml-2 text-xs">
                  {registration.registrantCountry}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {registration.abuseEmail ? (
          <div>
            <dt className="text-muted-foreground text-xs">Abuse contact</dt>
            <dd className="text-foreground mt-0.5 flex items-center gap-1 font-mono text-xs">
              <span className="truncate">{registration.abuseEmail}</span>
              <CopyButton value={registration.abuseEmail} />
            </dd>
          </div>
        ) : null}
      </dl>
    </Widget>
  );
};

export const StatusWidget: FC<RegistrationProps> = ({ registration }) => {
  if (registration.status.length === 0) return null;

  return (
    <Widget
      variant="section"
      title="Domain status"
      icon={<KeyRound className="size-3.5" />}
    >
      <ul className="flex flex-wrap gap-1.5">
        {registration.status.map((status) => (
          <li key={status}>
            <Badge variant="secondary" className="font-mono text-xs">
              {status}
            </Badge>
          </li>
        ))}
      </ul>
    </Widget>
  );
};

export const NameserverWidget: FC<RegistrationProps> = ({ registration }) => {
  if (registration.nameservers.length === 0) return null;

  return (
    <Widget
      variant="section"
      title="Nameservers"
      icon={<Server className="size-3.5" />}
      subtitle={`${registration.nameservers.length} delegated`}
    >
      <ul className="space-y-1.5">
        {registration.nameservers.map((ns) => (
          <li
            key={ns}
            className="bg-muted/40 hover:bg-muted/60 flex items-center justify-between gap-2 rounded-lg px-3 py-2 font-mono text-xs transition-colors"
          >
            <span className="truncate">{ns}</span>
            <CopyButton value={ns} />
          </li>
        ))}
      </ul>
    </Widget>
  );
};

export const DnssecWidget: FC<RegistrationProps> = ({ registration }) => {
  if (registration.dnssec === null) return null;

  return (
    <Widget
      variant="section"
      title="DNSSEC"
      icon={<ShieldCheck className="size-3.5" />}
    >
      <div className="flex items-center gap-3">
        <span
          className={
            registration.dnssec
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
          }
          aria-hidden
        >
          <span className="inline-flex size-2.5 rounded-full bg-current" />
        </span>
        <p className="text-foreground text-sm">
          {registration.dnssec
            ? "Signed delegation in place."
            : "No DNSSEC delegation reported."}
        </p>
      </div>
    </Widget>
  );
};
