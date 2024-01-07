import DnsResolver, {
  DoHResponse,
  type RawRecord,
  RECORD_TYPES_BY_DECIMAL,
  type RecordType,
} from './DnsResolver';

export default class CloudflareDoHResolver extends DnsResolver {
  public async resolveRecordType(
    domain: string,
    type: RecordType
  ): Promise<RawRecord[]> {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`,
      {
        method: 'GET',
        headers: { Accept: 'application/dns-json' },
      }
    );
    if (!response.ok)
      throw new Error(`Bad response from Cloudflare: ${response.statusText}`);
    const results = (await response.json()) as DoHResponse;

    return (
      results.Answer?.map((answer) => ({
        name: answer.name,
        type:
          answer.type in RECORD_TYPES_BY_DECIMAL
            ? // @ts-expect-error
              RECORD_TYPES_BY_DECIMAL[answer.type]
            : 'UNKNOWN',
        TTL: answer.TTL,
        data: answer.data,
      })) || []
    );
  }
}
