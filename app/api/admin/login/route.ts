import { cookies } from "next/headers";
import { buildSessionCookie, createSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (password !== adminPassword) {
    return Response.json({ message: "Senha incorreta" }, { status: 401 });
  }
  const token = await createSessionToken();
  const c = buildSessionCookie(token);
  cookies().set(c.name, c.value, c.options);
  return Response.json({ ok: true });
}
