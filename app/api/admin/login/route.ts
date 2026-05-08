import { cookies } from "next/headers";
import { buildSessionCookie, createSessionToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    logger.error("ADMIN_PASSWORD env var is not set", { route: "/api/admin/login" });
    return Response.json({ message: "Server misconfigured" }, { status: 500 });
  }
  const { password } = await req.json();
  if (password !== adminPassword) {
    return Response.json({ message: "Senha incorreta" }, { status: 401 });
  }
  const token = await createSessionToken();
  const c = buildSessionCookie(token);
  cookies().set(c.name, c.value, c.options);
  return Response.json({ ok: true });
}
