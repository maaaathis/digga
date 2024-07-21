import { bigquery } from '@/lib/bigquery';

export const getTopDomains = async (count: number) => {
  if (!bigquery) {
    return [];
  }

  const tableName = `\`${bigquery.projectId}.${process.env.BIGQUERY_DATASET}.lookups\``;
  const results = await bigquery.query({
    query: `
      SELECT baseDomain
      FROM ${tableName}
      WHERE baseDomain IS NOT NULL
      GROUP BY baseDomain
      ORDER BY COUNT(*) DESC
      LIMIT ${count}
    `,
  });

  return results.map((row: any) => row.baseDomain) as string[];
};
