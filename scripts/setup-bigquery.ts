// Bootstraps the BigQuery dataset, tables, and materialized view.
// Run once per environment: `pnpm bigquery:setup`.
// Idempotent: CREATE ... IF NOT EXISTS for every object.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

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

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "..", "bigquery", "schema.sql");

function loadCredentials(): ServiceAccount {
  const raw = process.env.GOOGLE_SERVICE_KEY_B64;
  if (!raw) {
    console.error("GOOGLE_SERVICE_KEY_B64 is missing.");
    process.exit(1);
  }
  return JSON.parse(Buffer.from(raw, "base64").toString()) as ServiceAccount;
}

async function token(scope: string, credentials: ServiceAccount): Promise<string> {
  return getAccessToken({ credentials, scope });
}

async function ensureDataset(
  credentials: ServiceAccount,
  dataset: string,
  location: string,
): Promise<void> {
  const accessToken = await token(
    "https://www.googleapis.com/auth/bigquery",
    credentials,
  );

  const check = await fetch(
    `https://bigquery.googleapis.com/bigquery/v2/projects/${credentials.project_id}/datasets/${dataset}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (check.ok) {
    console.log(`[ok] dataset ${dataset} already exists`);
    return;
  }
  if (check.status !== 404) {
    const body = await check.text();
    throw new Error(`Unexpected dataset check status ${check.status}: ${body}`);
  }

  const create = await fetch(
    `https://bigquery.googleapis.com/bigquery/v2/projects/${credentials.project_id}/datasets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        datasetReference: {
          datasetId: dataset,
          projectId: credentials.project_id,
        },
        location,
      }),
    },
  );

  if (!create.ok) {
    const body = await create.text();
    throw new Error(`Failed to create dataset: ${create.status} ${body}`);
  }
  console.log(`[created] dataset ${dataset} in ${location}`);
}

function splitStatements(sql: string): string[] {
  return sql
    .split(/;\s*(?:\n|$)/)
    .map((block) =>
      block
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((statement) => statement.length > 0);
}

async function runStatement(
  statement: string,
  credentials: ServiceAccount,
  location: string,
): Promise<void> {
  const accessToken = await token(
    "https://www.googleapis.com/auth/bigquery",
    credentials,
  );

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
        location,
        query: statement,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Statement failed: ${response.status} ${body}`);
  }
}

async function main(): Promise<void> {
  const credentials = loadCredentials();
  const dataset = process.env.BIGQUERY_DATASET;
  const location = process.env.BIGQUERY_LOCATION || "EU";

  if (!dataset) {
    console.error("BIGQUERY_DATASET is missing.");
    process.exit(1);
  }

  console.log(
    `Project: ${credentials.project_id}, dataset: ${dataset}, location: ${location}`,
  );

  await ensureDataset(credentials, dataset, location);

  const rawSchema = readFileSync(schemaPath, "utf8");
  const expanded = rawSchema
    .replace(/\$\{PROJECT\}/g, credentials.project_id)
    .replace(/\$\{DATASET\}/g, dataset);

  const statements = splitStatements(expanded);
  console.log(`Running ${statements.length} statement(s)`);

  let index = 0;
  for (const statement of statements) {
    index += 1;
    const firstLine = statement.split("\n").find(Boolean) ?? "";
    console.log(`[${index}/${statements.length}] ${firstLine.slice(0, 90)}...`);
    try {
      await runStatement(statement, credentials, location);
      console.log("    ok");
    } catch (error) {
      console.error("    failed:", error);
      process.exit(1);
    }
  }

  console.log("\nDone. dns_observations and ip_metadata are ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
