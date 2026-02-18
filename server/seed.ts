import { db } from "./db";
import { projects, helpRequests, trainings, teams, projectTypes, DEFAULT_TEAMS, PROJECT_TYPES } from "@shared/schema";
import { ne } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  console.log("Running database cleanup...");
  await db.delete(projects);
  await db.delete(helpRequests);
  await db.delete(trainings).where(ne(trainings.title, "n8n - Automacao de Workflows"));
  await db.delete(teams);
  for (const name of DEFAULT_TEAMS) {
    await db.insert(teams).values({ name }).onConflictDoNothing();
  }

  // Ensure project_types table exists and seed defaults
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS project_types (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE
    )
  `);
  for (const name of PROJECT_TYPES) {
    await db.insert(projectTypes).values({ name }).onConflictDoNothing();
  }

  console.log("Database cleanup complete. Teams: Tech, Supply, Marketing. Default project types seeded.");
}
