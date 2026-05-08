import { NextResponse, type NextRequest } from "next/server";
import { readSessionFromCookieValue, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const value = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await readSessionFromCookieValue(value);
  if (!session) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin"],
};
