import { parse } from 'tldts';

export const cleanDomain = (domain: string) => {
  const parsedDomain = parse(domain.trim().toLowerCase());

  return (
    (parsedDomain.subdomain === 'www' && parsedDomain.domain) ||
    parsedDomain.hostname
  );
};
