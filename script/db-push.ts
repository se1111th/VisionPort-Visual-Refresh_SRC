import { loadLocalEnv, requireEnv } from "./env";
import { pushSchema } from "./push-schema";

loadLocalEnv();
const databaseUrl = requireEnv("DATABASE_URL");

await pushSchema(databaseUrl);
