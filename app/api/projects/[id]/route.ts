import { z } from "zod";
import { storage } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth";
import { insertProjectSchema } from "@shared/schema";
import { logger } from "@/lib/logger";

type Ctx = { params: { id: string } };

const updateProjectSchema = insertProjectSchema.partial();

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const project = await storage.getProject(params.id);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    return Response.json(project);
  } catch (error) {
    logger.error("Failed to fetch project", { error, project_id: params.id });
    return Response.json({ message: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const unauth = await requireAdmin(req);
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const parsed = updateProjectSchema.parse(body);
    const project = await storage.updateProject(params.id, parsed);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    return Response.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Dados invalidos", errors: error.errors }, { status: 400 });
    }
    logger.error("Failed to update project", { error, project_id: params.id });
    return Response.json({ message: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const unauth = await requireAdmin(req);
  if (unauth) return unauth;
  try {
    const deleted = await storage.deleteProject(params.id);
    if (!deleted) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    return Response.json({ message: "Project deleted" });
  } catch (error) {
    logger.error("Failed to delete project", { error, project_id: params.id });
    return Response.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
