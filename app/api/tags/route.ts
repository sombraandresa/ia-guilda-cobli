import { storage } from "@/lib/storage";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const tags = await storage.getAllTags();
    return Response.json(tags);
  } catch (error) {
    logger.error("Failed to fetch tags", { error });
    return Response.json({ message: "Failed to fetch tags" }, { status: 500 });
  }
}
