import DnsResolver, {
  DoHResponse,
  type RawRecord,
  RECORD_TYPES_BY_DECIMAL,
  type RecordType,
} from './DnsResolver';

export default class YandexDoHResolver extends DnsResolver {
  public async resolveRecordType(
    domain: string,
    type: RecordType
  ): Promise<RawRecord[]> {
    const response = await fetch(
      `https://common.dot.dns.yandex.net/dns-query?name=${domain}&type=${type}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }
    );
    if (!response.ok)
      throw new Error(`Bad response from Yandex: ${response.statusText}`);
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
  }
}
