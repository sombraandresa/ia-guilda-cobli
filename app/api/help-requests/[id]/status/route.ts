import { z } from "zod";
import { storage } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth";
import { HELP_STATUSES } from "@shared/schema";
import { logger } from "@/lib/logger";

type Ctx = { params: { id: string } };

const statusSchema = z.object({ status: z.enum(HELP_STATUSES) });

export async function PATCH(req: Request, { params }: Ctx) {
  const unauth = await requireAdmin(req);
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const { status } = statusSchema.parse(body);
    const updated = await storage.updateHelpRequestStatus(params.id, status);
    if (!updated) {
      return Response.json({ message: "Help request not found" }, { status: 404 });
    }
    return Response.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Dados invalidos", errors: error.errors }, { status: 400 });
    }
    logger.error("Failed to update help request status", { error, help_request_id: params.id });
    return Response.json({ message: "Failed to update help request" }, { status: 500 });
  }
}
