import { z } from "zod";
import { storage } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth";
import { insertTrainingSchema } from "@shared/schema";
import { logger } from "@/lib/logger";

type Ctx = { params: { id: string } };

const updateTrainingSchema = insertTrainingSchema.partial();

export async function PATCH(req: Request, { params }: Ctx) {
  const unauth = await requireAdmin(req);
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const parsed = updateTrainingSchema.parse(body);
    const updated = await storage.updateTraining(params.id, parsed);
    if (!updated) {
      return Response.json({ message: "Training not found" }, { status: 404 });
    }
    return Response.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Dados invalidos", errors: error.errors }, { status: 400 });
    }
    logger.error("Failed to update training", { error, training_id: params.id });
    return Response.json({ message: "Failed to update training" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const unauth = await requireAdmin(req);
  if (unauth) return unauth;
  try {
    const deleted = await storage.deleteTraining(params.id);
    if (!deleted) {
      return Response.json({ message: "Training not found" }, { status: 404 });
    }
    return Response.json({ message: "Training deleted" });
  } catch (error) {
    logger.error("Failed to delete training", { error, training_id: params.id });
    return Response.json({ message: "Failed to delete training" }, { status: 500 });
  }
}
