import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";

const adminSessions = new Set<string>();

export function createAdminToken(): string {
  const token = randomUUID();
  adminSessions.add(token);
  return token;
}

export function destroyAdminToken(token: string): void {
  adminSessions.delete(token);
}

export function isValidAdminToken(token: string): boolean {
  return adminSessions.has(token);
}

export function getBearerToken(req: NextRequest | Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export function unauthorized(): Response {
  return Response.json({ message: "Nao autorizado" }, { status: 401 });
}

export function requireAdmin(req: NextRequest | Request): Response | null {
  const token = getBearerToken(req);
  if (!token || !isValidAdminToken(token)) {
    return unauthorized();
  }
  return null;
}
