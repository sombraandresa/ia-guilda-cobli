import { storage } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const project = await storage.getProject(params.id);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    return Response.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return Response.json({ message: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const project = await storage.updateProject(params.id, body);
    if (!project) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    return Response.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return Response.json({ message: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const deleted = await storage.deleteProject(params.id);
    if (!deleted) {
      return Response.json({ message: "Project not found" }, { status: 404 });
    }
    return Response.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return Response.json({ message: "Failed to delete project" }, { status: 500 });
  }
}
