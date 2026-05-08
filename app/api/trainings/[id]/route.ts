import { storage } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const updated = await storage.updateTraining(params.id, body);
    if (!updated) {
      return Response.json({ message: "Training not found" }, { status: 404 });
    }
    return Response.json(updated);
  } catch (error) {
    console.error("Error updating training:", error);
    return Response.json({ message: "Failed to update training" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const deleted = await storage.deleteTraining(params.id);
    if (!deleted) {
      return Response.json({ message: "Training not found" }, { status: 404 });
    }
    return Response.json({ message: "Training deleted" });
  } catch (error) {
    console.error("Error deleting training:", error);
    return Response.json({ message: "Failed to delete training" }, { status: 500 });
  }
}
