import DnsResolver, {
  DoHResponse,
  type RawRecord,
  RECORD_TYPES_BY_DECIMAL,
  type RecordType,
} from './DnsResolver';
import { isValidLookupDomain } from '@/lib/utils';

export default class AlibabaDoHResolver extends DnsResolver {
  public async resolveRecordType(
    domain: string,
    type: RecordType
  ): Promise<RawRecord[]> {
    if (!isValidLookupDomain(domain)) return [];

    try {
      const response = await fetch(
        `https://dns.alidns.com/resolve?name=${domain}&type=${type}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
        }
      );
      if (!response.ok) {
        console.warn(
          `Alibaba resolver returned ${response.statusText} for domain ${domain}`
        );
        return [];
      }
      const results = (await response.json()) as DoHResponse;

      if (!results.Answer) {
        return [];
      }

      const filteredAnswers = results.Answer.filter(
        (answer) =>
          answer.type in RECORD_TYPES_BY_DECIMAL &&
          // @ts-expect-error
          RECORD_TYPES_BY_DECIMAL[answer.type] === type
      );

      return filteredAnswers.map((answer) => ({
        name: answer.name,
        type,
        TTL: answer.TTL,
        data: answer.data,
      }));
    } catch (error) {
      console.error(`Alibaba resolver error for domain ${domain}:`, error);
      return [];
    }
  }
}
