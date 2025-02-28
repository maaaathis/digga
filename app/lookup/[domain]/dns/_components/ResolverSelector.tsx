'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useCallback } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ResolverSelectorProps = {
  initialValue?: string;
};

const ResolverSelector: FC<ResolverSelectorProps> = ({ initialValue }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onValueChange = useCallback(
    (value: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      if (!value || value === 'authoritative') {
        current.delete('resolver');
      } else {
        current.set('resolver', value);
      }

      const search = current.toString();
      router.push(`${pathname}${search ? `?${search}` : ''}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-sm">Resolver</span>

      <Select
        defaultValue={initialValue || 'authoritative'}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-[180px]" aria-label="Resolver">
          <SelectValue placeholder="Resolver" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="authoritative">Authoritative</SelectItem>
          <SelectItem value="google">Google</SelectItem>
          <SelectItem value="cloudflare">Cloudflare</SelectItem>
          <SelectItem value="alibaba">Alibaba Public DNS</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ResolverSelector;
