import { storage } from "@/lib/storage";

export async function GET() {
  try {
    const teams = await storage.getTeams();
    return Response.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return Response.json({ message: "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return Response.json({ message: "Nome do time obrigatorio" }, { status: 400 });
    }
    const team = await storage.createTeam(name.trim());
    return Response.json(team, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return Response.json({ message: "Failed to create team" }, { status: 500 });
  }
}
