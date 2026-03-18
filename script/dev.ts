import { loadLocalEnv, requireEnv } from "./env";
import { pushSchema } from "./push-schema";

loadLocalEnv();
const databaseUrl = requireEnv("DATABASE_URL");
process.env.NODE_ENV = "development";

console.log("Pushing database schema...");
await pushSchema(databaseUrl);

console.log("Starting development server...");
await import("../server/index.ts");
