import { storage } from "@/lib/storage";

export async function GET() {
  try {
    const tags = await storage.getAllTags();
    return Response.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return Response.json({ message: "Failed to fetch tags" }, { status: 500 });
  }
}
