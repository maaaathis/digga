import DataLoader from 'dataloader';
import dnsPacket, {
  type Answer,
  type Packet,
  type Question,
  type StringAnswer,
} from 'dns-packet';
import dgram from 'node:dgram';

import { isValidLookupDomain } from '@/lib/utils';

import { retry } from '../utils';
import DnsResolver, { type RawRecord, type RecordType } from './DnsResolver';

class AuthoritativeResolver extends DnsResolver {
  private async getRootServers(): Promise<string[]> {
    const response = await fetch('https://www.internic.net/domain/named.root', {
      next: { revalidate: 7 * 24 * 60 * 60 },
    });
    const body = await response.text();
    const aRecords = body.match(/\sA\s+(.+)/g);
    const aaaaRecords = body.match(/\sAAAA\s+(.+)/g);
    if (!aRecords && !aaaaRecords)
      throw new Error('Failed to fetch root servers');
    return [...(aRecords || []), ...(aaaaRecords || [])].map(
      (l) => l.replaceAll(/\s+/g, ' ').split(' ')[2]
    );
  }

  private recordToString(record: Answer): string {
    switch (record.type) {
      case 'A':
      case 'AAAA':
      case 'CNAME':
      case 'DNAME':
      case 'PTR':
        return record.data;
      case 'TXT':
        if (Array.isArray(record.data)) {
          return record.data
            .map((item) =>
              item instanceof Buffer ? item.toString() : String(item)
            )
            .join(' ');
        }
        return record.data instanceof Buffer
          ? record.data.toString()
          : String(record.data);
      case 'CAA':
        return `${record.data.flags} ${record.data.tag} "${record.data.value}"`;
      case 'DNSKEY':
        return `${record.data.flags} ${record.data.algorithm} ${record.data.key.toString('base64')}`;
      case 'DS':
        return `${record.data.keyTag} ${record.data.algorithm} ${record.data.digestType} ${record.data.digest.toString('hex').toUpperCase()}`;
      case 'MX':
        return `${record.data.preference} ${record.data.exchange}`;
      case 'NAPTR':
        return `${record.data.order} ${record.data.preference} "${record.data.flags}" "${record.data.services}" "${record.data.regexp}" ${record.data.replacement}`;
      case 'NS':
        return record.data;
      case 'RRSIG':
        return `${record.data.typeCovered} ${record.data.algorithm} ${record.data.labels} ${record.data.originalTTL} ${record.data.expiration} ${record.data.inception} ${record.data.keyTag} ${record.data.signersName} ${record.data.signature.toString('base64')}`;
      case 'SOA':
        return `${record.data.mname} ${record.data.rname} ${record.data.serial} ${record.data.refresh} ${record.data.retry} ${record.data.expire} ${record.data.minimum}`;
      case 'SRV':
        return `${record.data.priority} ${record.data.weight} ${record.data.port} ${record.data.target}`;
      default:
        return 'Unknown Record Type';
    }
  }

  private async sendRequest(
    domain: string,
    recordType: RecordType,
    nameserver: string
  ) {
    const packetBuffer = dnsPacket.encode({
      type: 'query',
      id: 1,
      questions: [{ type: recordType, name: domain } as Question],
    });
    const socket = dgram.createSocket({
      type: nameserver.includes(':') ? 'udp6' : 'udp4',
    });
    socket.send(packetBuffer, 0, packetBuffer.length, 53, nameserver);
    return await new Promise<Packet>((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.close();
        resolve({ answers: [] });
      }, 3000);
      socket.on('message', (message: Buffer) => {
        socket.close();
        clearTimeout(timeout);
        resolve(dnsPacket.decode(message));
      });
      socket.on('error', reject);
    });
  }

  private requestLoader = new DataLoader<
    { domain: string; type: RecordType; nameserver: string },
    Packet,
    string
  >(
    async (keys) =>
      Promise.all(
        keys.map(async ({ domain, type, nameserver }) =>
          retry(() => this.sendRequest(domain, type, nameserver), 3)
        )
      ),
    { cacheKeyFn: (key) => JSON.stringify(key) }
  );

  public async fetchRecords(
    domain: string,
    recordType: RecordType,
    nameserver?: string,
    depth: number = 0
  ): Promise<RawRecord[]> {
    if (!isValidLookupDomain(domain)) return [];

    if (depth > 5) {
      console.warn(`DNS recursion depth exceeded for domain ${domain}`);
      return [];
    }
    const rootServers = await this.getRootServers();
    const response = await this.requestLoader.load({
      domain,
      type: recordType,
      nameserver: nameserver ?? rootServers[0],
    });
    if (response.answers?.length) {
      const filteredAnswers = response.answers.filter(
        (answer: Answer) => answer.name === domain && answer.type === recordType
      ) as Extract<Answer, { type: RecordType }>[];
      return (
        filteredAnswers?.map((answer) => ({
          name: answer.name,
          type: answer.type,
          TTL: 'ttl' in answer ? answer.ttl || 0 : 0,
          data: this.recordToString(answer),
        })) || []
      );
    }
    const redirects = Object.assign(
      [],
      response.authorities,
      response.additionals
    ).filter((answer: Answer) => answer.type === 'A' || answer.type === 'NS');
    if (!redirects.length) {
      console.warn(`No redirect information found for domain ${domain}`);
      return [];
    }
    const ipValue = (
      redirects.find((redirect: Answer) => redirect.type === 'A') as
        | StringAnswer
        | undefined
    )?.data;
    if (ipValue) {
      try {
        return await this.fetchRecords(domain, recordType, ipValue, depth + 1);
      } catch (error) {
        console.warn(
          `Failed to fetch records from A record ${ipValue} for domain ${domain}:`,
          error
        );
        return [];
      }
    }
    const nsValue = (
      redirects.find((redirect: Answer) => redirect.type === 'NS') as
        | StringAnswer
        | undefined
    )?.data;
    if (!nsValue) {
      console.warn(`No valid NS record found for domain ${domain}`);
      return [];
    }
    try {
      const records = await this.fetchRecords(
        nsValue,
        'A',
        undefined,
        depth + 1
      );
      if (!records.length) {
        console.warn(
          `Could not resolve NS nameserver ${nsValue} for domain ${domain}`
        );
        return [];
      }
      return this.fetchRecords(domain, recordType, records[0].data, depth + 1);
    } catch (error) {
      console.warn(
        `Failed to resolve NS nameserver ${nsValue} for domain ${domain}:`,
        error
      );
      return [];
    }
  }

  public async resolveRecordType(
    domain: string,
    type: RecordType
  ): Promise<RawRecord[]> {
    return this.fetchRecords(domain, type);
  }
}

export default AuthoritativeResolver;
