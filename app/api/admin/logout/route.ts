import { destroyAdminToken, getBearerToken, requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const token = getBearerToken(req);
  if (token) destroyAdminToken(token);
  return Response.json({ message: "Logout realizado" });
}
