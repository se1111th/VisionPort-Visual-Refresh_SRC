import { spawnSync } from "node:child_process";
import { Client } from "pg";

const REQUIRED_TABLES = ["playlists", "scenes", "assets"] as const;

async function verifySchema(databaseUrl: string) {
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    const result = await client.query<{ table_name: string }>(
      `select table_name
       from information_schema.tables
       where table_schema = 'public'
         and table_name = any($1::text[])`,
      [REQUIRED_TABLES],
    );

    const existingTables = new Set(result.rows.map((row) => row.table_name));
    const missingTables = REQUIRED_TABLES.filter((tableName) => !existingTables.has(tableName));
    if (missingTables.length > 0) {
      throw new Error(`Schema verification failed. Missing tables: ${missingTables.join(", ")}`);
    }
  } finally {
    await client.end();
  }
}

export async function pushSchema(databaseUrl: string) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["exec", "--", "drizzle-kit", "push"], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }

  await verifySchema(databaseUrl);
}
