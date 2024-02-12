'use client';

import isValidDomain from 'is-valid-domain';
import { Loader2, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { toASCII } from 'punycode';
import {
  ChangeEvent,
  FC,
  FormEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { parse } from 'tldts';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { cn, isAppleDevice } from '@/lib/utils';

enum FormStates {
  Initial,
  Submitting,
  Success,
}

type SearchFormProps = {
  initialValue?: string;
  autofocus?: boolean;
  className?: string;
};

const SearchForm: FC<SearchFormProps> = (props): ReactElement => {
  const router = useRouter();
  const pathname = usePathname();

  const [domain, setDomain] = useState('');
  const [state, setState] = useState<FormStates>(FormStates.Initial);
  const [error, setError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  useHotkeys(
    isAppleDevice() ? ['meta+k', 's', 'shift+7'] : ['ctrl+k', 's', 'shift+7'],
    () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    },
    { preventDefault: true },
    [inputRef.current]
  );

  useEffect(() => {
    if (props.initialValue) {
      setDomain(props.initialValue);
    }
  }, [props.initialValue]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(false);
    setState(FormStates.Submitting);

    const parsedDomain = parse(domain.trim().toLowerCase());

    const cleanedDomain =
      (parsedDomain.subdomain === 'www' && parsedDomain.domain) ||
      parsedDomain.hostname;

    if (!parsedDomain || !cleanedDomain) {
      setError(true);
      setState(FormStates.Initial);
      return;
    }

    let normalizedDomain = cleanedDomain.endsWith('.')
      ? cleanedDomain.slice(0, -1)
      : cleanedDomain;
    normalizedDomain = toASCII(normalizedDomain);

    if (!isValidDomain(normalizedDomain)) {
      setError(true);
      setState(FormStates.Initial);
      return;
    }

    const target = `/lookup/${normalizedDomain}`;

    if (pathname === target) {
      router.refresh();
      setTimeout(() => {
        setState(FormStates.Initial);
      }, 150);
      return;
    }

    router.push(target);
  };

  return (
    <>
      <form className="flex gap-3" onSubmit={handleSubmit}>
        <div className="relative flex-[4]">
          <Input
            ref={inputRef}
            className={cn('font-wider', props.className)}
            type="text"
            required
            placeholder="example.com"
            aria-label="Domain"
            value={domain}
            onInput={(event: ChangeEvent<HTMLInputElement>) =>
              setDomain(event.target.value)
            }
            disabled={state !== FormStates.Initial}
            autoFocus={props.autofocus}
            autoCapitalize="none"
            autoComplete="url"
            autoCorrect="off"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            {isAppleDevice() ? (
              <>
                <span className="text-xs">⌘</span>K
              </>
            ) : (
              'ctrl+k'
            )}
          </kbd>
        </div>
        <Button
          className="h-12 flex-[1]"
          type="submit"
          disabled={state !== FormStates.Initial}
          aria-label="Lookup Domain"
        >
          {state === FormStates.Submitting && (
            <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
          )}
          <Search
            className={`h-6 w-6 md:hidden ${
              state === FormStates.Submitting && 'hidden'
            }`}
          />
          <span className="hidden md:block">Lookup</span>
        </Button>
      </form>

      {error ? (
        <p className="mt-3 text-center text-sm text-red-600">
          An error occured! Please check your input or try again later.
        </p>
      ) : (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          It can be anything! An apex, subdomain, or even a URL.
        </p>
      )}
    </>
  );
};

export default SearchForm;
