import { storage } from "@/lib/storage";
import { requireAdmin } from "@/lib/auth";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const unauth = await requireAdmin(req);
  if (unauth) return unauth;
  try {
    const { status } = await req.json();
    const updated = await storage.updateHelpRequestStatus(params.id, status);
    if (!updated) {
      return Response.json({ message: "Help request not found" }, { status: 404 });
    }
    return Response.json(updated);
  } catch (error) {
    console.error("Error updating help request:", error);
    return Response.json({ message: "Failed to update help request" }, { status: 500 });
  }
}
