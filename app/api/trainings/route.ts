import { z } from "zod";
import { storage } from "@/lib/storage";
import { insertTrainingSchema } from "@shared/schema";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const trainings = await storage.getTrainings();
    return Response.json(trainings);
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return Response.json({ message: "Failed to fetch trainings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const parsed = insertTrainingSchema.parse(body);
    const training = await storage.createTraining(parsed);
    return Response.json(training, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Dados invalidos", errors: error.errors }, { status: 400 });
    }
    console.error("Error creating training:", error);
    return Response.json({ message: "Failed to create training" }, { status: 500 });
  }
}
