import { ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import type { FC, ReactElement } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type DomainLinkProps = {
  domain: string;
};

const DomainLink: FC<DomainLinkProps> = ({ domain }): ReactElement => (
  <>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            className="select-none underline decoration-dotted underline-offset-4 hover:decoration-dashed"
            href={`/lookup/${domain}`}
            rel="nofollow"
          >
            <span>{domain}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>View Domain Records</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    {!domain.startsWith('*.') && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`https://${domain}`}
              target="_blank"
              rel="noreferrer noopener nofollow"
            >
              <ExternalLinkIcon className="mx-1 inline-block h-3 w-3 -translate-y-0.5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Visit URL</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </>
);

export default DomainLink;
