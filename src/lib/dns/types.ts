export const RECORD_TYPES = [
  "A",
  "AAAA",
  "CAA",
  "CNAME",
  "DNSKEY",
  "DS",
  "MX",
  "NAPTR",
  "NS",
  "PTR",
  "SOA",
  "SRV",
  "TXT",
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];

export const RECORD_TYPE_BY_DECIMAL: Record<number, RecordType> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  33: "SRV",
  35: "NAPTR",
  43: "DS",
  48: "DNSKEY",
  257: "CAA",
};

export type DoHResponse = {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: { name: string; type: number }[];
  Answer?: { name: string; type: number; TTL: number; data: string }[];
  Authority?: { name: string; type: number; TTL: number; data: string }[];
};

export type RawRecord = {
  name: string;
  type: RecordType;
  TTL: number;
  data: string;
};

export type ResolvedRecords = Record<RecordType, RawRecord[]>;

export const EMPTY_RECORDS: ResolvedRecords = RECORD_TYPES.reduce(
  (acc, type) => {
    acc[type] = [];
    return acc;
  },
  {} as ResolvedRecords,
);

export type ResolverId = "cloudflare" | "google" | "alibaba";

export const RESOLVERS: { id: ResolverId; label: string; endpoint: string }[] =
  [
    {
      id: "cloudflare",
      label: "Cloudflare",
      endpoint: "https://cloudflare-dns.com/dns-query",
    },
    {
      id: "google",
      label: "Google",
      endpoint: "https://dns.google/resolve",
    },
    {
      id: "alibaba",
      label: "Alibaba",
      endpoint: "https://dns.alidns.com/resolve",
    },
  ];
