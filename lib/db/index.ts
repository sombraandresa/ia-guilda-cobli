import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

const rawUrl = process.env.DATABASE_URL?.trim();
if (!rawUrl) {
  throw new Error("DATABASE_URL is not set");
}
// Strip surrounding quotes that some .env editors leave behind.
const connectionString = rawUrl.replace(/^["'](.*)["']$/, "$1");

if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
