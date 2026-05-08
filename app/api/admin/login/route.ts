import { createAdminToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (password === adminPassword) {
    const token = createAdminToken();
    return Response.json({ token });
  }
  return Response.json({ message: "Senha incorreta" }, { status: 401 });
}
