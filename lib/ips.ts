import DataLoader from 'dataloader';

type IpDetails = {
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
};

export const getIpDetails = async (ip: string) => {
  const response = await fetch(`http://ip-api.com/json/${ip}`);

  if (!response.ok)
    throw new Error(`Error fetching IP details: ${response.statusText}`);

  const data = (await response.json()) as Record<string, any>;
  delete data.status;

  return data as IpDetails;
};

export const getIpGreenDetails = async (ip: string): Promise<boolean> => {
  const response = await fetch(
    `https://api.thegreenwebfoundation.org/greencheck/${ip}`
  );

  if (!response.ok)
    throw new Error(`Error fetching GREEN-IP details: ${response.statusText}`);

  const data = (await response.json()) as Record<string, any>;
  delete data.status;

  return data.green;
};

// Standardize last segment of IP address to reduce the number of requests and avoid rate limiting
// 1st Regex is for IPv4
// 2nd Regex is for IPv6
export const normalizeIpEnding = (ip: string) =>
  ip.replace(/\.[0-9]+$/, '.0').replace(/:([0-9a-fA-F]+)$/, ':');

// Normalize IPs to their CIDR ranges to reduce the number of requests and avoid rate limiting
export const hostLookupLoader = new DataLoader(
  async (keys: readonly string[]) =>
    Promise.all(
      keys.map(async (ip) => {
        const normalIp = normalizeIpEnding(ip);
        const data = await getIpDetails(normalIp);

        if (data.org === data.isp) {
          return data.org;
        }

        return `${data.org} / ${data.isp}`;
      })
    ),
  {
    cacheKeyFn: normalizeIpEnding,
  }
);

export const getIpsInfo = async (
  ips: string[]
): Promise<Record<string, string>> => {
  const hosts = await hostLookupLoader.loadMany(ips);
  return Object.fromEntries(
    ips
      .map((ip, index) => [ip, hosts[index]])
      .filter(([, host]) => typeof host === 'string')
  );
};
