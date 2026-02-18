import { db } from "./db";
import { teams, projectTypes, DEFAULT_TEAMS, DEFAULT_PROJECT_TYPES } from "@shared/schema";

export async function seedDatabase() {
  const existingTeams = await db.select({ id: teams.id }).from(teams).limit(1);
  if (existingTeams.length === 0) {
    console.log("Seeding default teams...");
    for (const name of DEFAULT_TEAMS) {
      await db.insert(teams).values({ name }).onConflictDoNothing();
    }
  }

  const existingTypes = await db.select({ id: projectTypes.id }).from(projectTypes).limit(1);
  if (existingTypes.length === 0) {
    console.log("Seeding default project types...");
    for (const name of DEFAULT_PROJECT_TYPES) {
      await db.insert(projectTypes).values({ name }).onConflictDoNothing();
    }
  }

  console.log("Database seed complete.");
}
