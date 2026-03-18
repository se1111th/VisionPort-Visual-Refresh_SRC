import { existsSync, readFileSync } from "node:fs";

function normalizeValue(rawValue: string) {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const inner = trimmed.slice(1, -1);
    return trimmed.startsWith('"')
      ? inner
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\"/g, '"')
      : inner;
  }

  return trimmed;
}

export function loadLocalEnv(envPath = ".env") {
  if (!existsSync(envPath)) {
    return;
  }

  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const withoutExport = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length)
      : trimmed;

    const separatorIndex = withoutExport.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = withoutExport.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const value = withoutExport.slice(separatorIndex + 1);
    process.env[key] = normalizeValue(value);
  }
}

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set. Copy .env.example to .env and update it for your local PostgreSQL database.`);
  }

  return value;
}
