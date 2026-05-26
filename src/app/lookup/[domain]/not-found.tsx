import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

import { Button } from "@/components/ui/button";

const NotFound: FC = () => (
  <div className="mx-auto max-w-2xl px-4 pt-24 pb-16 text-center">
    <div className="bg-muted text-muted-foreground mx-auto mb-6 inline-flex size-14 items-center justify-center rounded-2xl">
      <AlertTriangle className="size-7" />
    </div>
    <h1 className="text-foreground text-2xl font-semibold tracking-tight">
      Not a valid domain
    </h1>
    <p className="text-muted-foreground mt-3 text-base">
      The thing you typed does not look like a domain we can look up. Try an
      apex, subdomain, or full URL.
    </p>
    <Button asChild className="mt-6">
      <Link href="/">Back to search</Link>
    </Button>
  </div>
);

export default NotFound;
