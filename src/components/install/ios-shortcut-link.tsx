import { Smartphone } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

const SHORTCUT_URL =
  "https://www.icloud.com/shortcuts/7d45a70403ec4bf783d32c45ad61b2d1";

const IOSShortcutLink: FC = () => (
  <div className="flex justify-center">
    <Link
      href={SHORTCUT_URL}
      target="_blank"
      rel="noreferrer noopener"
      className="ring-border/60 hover:ring-foreground/40 bg-background text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm ring-1 transition-all duration-200 hover:-translate-y-0.5"
    >
      <Smartphone className="size-4" />
      Add shortcut
    </Link>
  </div>
);

export default IOSShortcutLink;
