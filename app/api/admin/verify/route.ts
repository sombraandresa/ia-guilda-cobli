import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return Response.json({ valid: false }, { status: 401 });
  }
  return Response.json({ valid: true });
}
