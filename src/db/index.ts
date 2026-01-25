import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/node-postgres";
import { cache } from "react";
import * as schema from "./schema";
import { Pool } from "pg";

/**
 * Connect to PostgreSQL Database (Supabase/Neon/Local PostgreSQL)
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase
 * https://opennext.js.org/cloudflare/howtos/db#hyperdrive-example
 */
export const getDbSync = cache(() => {
  const { env } = getCloudflareContext();
  const connectionString = env.HYPERDRIVE.connectionString;
  const pool = new Pool({
    connectionString,
    // You don't want to reuse the same connection for multiple requests
    maxUses: 1,
  });
  return drizzle({ client: pool, schema });
});

// This is the one to use for static routes (i.e. ISR/SSG)
export const getDb = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  const connectionString = env.HYPERDRIVE.connectionString;
  const pool = new Pool({
    connectionString,
    // You don't want to reuse the same connection for multiple requests
    maxUses: 1,
  });
  return drizzle({ client: pool, schema });
});

/**
 * Connect to Neon Database
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-neon
 */
// import { drizzle } from 'drizzle-orm/neon-http';
// const db = drizzle(process.env.DATABASE_URL!);

/**
 * Database connection with Drizzle
 * https://orm.drizzle.team/docs/connect-overview
 *
 * Drizzle <> PostgreSQL
 * https://orm.drizzle.team/docs/get-started-postgresql
 *
 * Get Started with Drizzle and Neon
 * https://orm.drizzle.team/docs/get-started/neon-new
 *
 * Drizzle with Neon Postgres
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-neon
 *
 * Drizzle <> Neon Postgres
 * https://orm.drizzle.team/docs/connect-neon
 *
 * Drizzle with Supabase Database
 * https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase
 */
