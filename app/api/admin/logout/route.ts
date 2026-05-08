import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  cookies().delete(SESSION_COOKIE_NAME);
  return Response.json({ ok: true });
}
