import { z } from "zod";
import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";

const createTeamSchema = z.object({ name: z.string().trim().min(1) });

export async function GET() {
  try {
    const teams = await storage.getTeams();
    return Response.json(teams);
  } catch (error) {
    logger.error("Failed to fetch teams", { error });
    return Response.json({ message: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = createTeamSchema.parse(body);
    const team = await storage.createTeam(name);
    return Response.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Nome do time obrigatorio", errors: error.errors }, { status: 400 });
    }
    logger.error("Failed to create team", { error });
    return Response.json({ message: "Failed to create team" }, { status: 500 });
  }
}
