import { z } from "zod";
import { storage } from "@/lib/storage";
import { insertProjectSchema } from "@shared/schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      q: searchParams.get("q") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      team: searchParams.get("team") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      type: searchParams.get("type") ?? undefined,
    };
    const projects = await storage.getProjects(filters);
    return Response.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return Response.json({ message: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = insertProjectSchema.parse(body);
    const project = await storage.createProject(parsed);
    return Response.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Dados invalidos", errors: error.errors }, { status: 400 });
    }
    console.error("Error creating project:", error);
    return Response.json({ message: "Failed to create project" }, { status: 500 });
  }
}
