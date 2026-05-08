import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  return Response.json({ valid: true });
}
