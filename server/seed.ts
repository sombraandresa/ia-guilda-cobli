import { db } from "./db";
import { projects, helpRequests, trainings, teams, DEFAULT_TEAMS } from "@shared/schema";
import { ne } from "drizzle-orm";

export async function seedDatabase() {
  console.log("Running database cleanup...");
  await db.delete(projects);
  await db.delete(helpRequests);
  await db.delete(trainings).where(ne(trainings.title, "n8n - Automacao de Workflows"));
  await db.delete(teams);
  for (const name of DEFAULT_TEAMS) {
    await db.insert(teams).values({ name }).onConflictDoNothing();
  }
  console.log("Database cleanup complete. Teams: Tech, Supply, Marketing.");
}
