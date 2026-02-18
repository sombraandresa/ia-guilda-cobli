import { db } from "./db";
import { teams, DEFAULT_TEAMS } from "@shared/schema";

export async function seedDatabase() {
  const existingTeams = await db.select({ id: teams.id }).from(teams).limit(1);
  if (existingTeams.length === 0) {
    console.log("Seeding database with default teams...");
    for (const name of DEFAULT_TEAMS) {
      await db.insert(teams).values({ name });
    }
    console.log(`Seeded ${DEFAULT_TEAMS.length} teams.`);
  }
}
