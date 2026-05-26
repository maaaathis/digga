import "server-only";

import { getAccessToken } from "web-auth-library/google";

type ServiceAccount = {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_id: string;
  client_email: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
};

function loadCredentials(): ServiceAccount | null {
  if (!process.env.GOOGLE_SERVICE_KEY_B64) return null;
  try {
    return JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_KEY_B64, "base64").toString(),
    ) as ServiceAccount;
  } catch (error) {
    console.error("Failed to parse GOOGLE_SERVICE_KEY_B64:", error);
    return null;
  }
}

const credentials = loadCredentials();
const isDev = process.env.ENVIRONMENT === "development";

async function token(scope: string): Promise<string> {
  if (!credentials) {
    throw new Error("Google credentials not configured");
  }
  return getAccessToken({ credentials, scope });
}

export async function insertRows({
  datasetName,
  tableName,
  rows,
}: {
  datasetName: string;
  tableName: string;
  rows: Record<string, unknown>[];
}): Promise<void> {
  if (isDev || !credentials) return;

  const accessToken = await token("https://www.googleapis.com/auth/cloud-platform");
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${credentials.project_id}/datasets/${datasetName}/tables/${tableName}/insertAll`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rows: rows.map((row) => ({ json: row })) }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `BigQuery insert failed: ${response.status} ${errorBody}`,
    );
  }
}

export async function query({
  query: sql,
  params,
}: {
  query: string;
  params?: Record<string, string | number>;
}): Promise<Record<string, unknown>[]> {
  if (!credentials) return [];

  const accessToken = await token("https://www.googleapis.com/auth/bigquery");

  const queryParameters = params
    ? Object.keys(params).map((key) => ({
        name: key,
        parameterType: {
          type: typeof params[key] === "number" ? "INT64" : "STRING",
        },
        parameterValue: { value: String(params[key]) },
      }))
    : [];

  const response = await fetch(
    `https://bigquery.googleapis.com/bigquery/v2/projects/${credentials.project_id}/queries`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: "bigquery#queryRequest",
        useLegacySql: false,
        location: process.env.BIGQUERY_LOCATION,
        query: sql,
        parameterMode: "NAMED",
        queryParameters,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`BigQuery query failed: ${response.status} ${errorBody}`);
  }

  const json = (await response.json()) as {
    schema?: { fields: { name: string }[] };
    rows?: { f: { v: unknown }[] }[];
  };

  if (!json.rows || !json.schema) return [];

  return json.rows.map((row) =>
    Object.fromEntries(
      row.f.map((field, index) => [json.schema!.fields[index].name, field.v]),
    ),
  );
}

export const bigquery = credentials
  ? {
      projectId: credentials.project_id,
      insertRows,
      query,
    }
  : null;

export async function logDomainLookup(args: {
  domain: string;
  baseDomain: string;
  publicSuffix: string | null;
  ip: string | null;
}): Promise<void> {
  if (!bigquery || !process.env.BIGQUERY_DATASET) return;

  try {
    await bigquery.insertRows({
      datasetName: process.env.BIGQUERY_DATASET,
      tableName: "domain_lookups",
      rows: [
        {
          domain: args.domain,
          baseDomain: args.baseDomain,
          publicSuffix: args.publicSuffix,
          ip: args.ip,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    if (error && typeof error === "object" && "errors" in error) {
      for (const err of (error as { errors: unknown[] }).errors) {
        console.error("BigQuery log error:", err);
      }
    } else {
      console.error("BigQuery log error:", error);
    }
  }
}

export async function getTopDomains(count: number): Promise<string[]> {
  if (!bigquery || !process.env.BIGQUERY_DATASET) return [];

  const tableName = `\`${bigquery.projectId}.${process.env.BIGQUERY_DATASET}.domain_lookups\``;
  const rows = await bigquery.query({
    query: `
      SELECT baseDomain
      FROM ${tableName}
      WHERE baseDomain IS NOT NULL
      GROUP BY baseDomain
      ORDER BY COUNT(*) DESC
      LIMIT ${count}
    `,
  });

  return rows
    .map((row) => row.baseDomain)
    .filter((d): d is string => typeof d === "string");
}
