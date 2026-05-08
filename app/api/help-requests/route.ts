import { z } from "zod";
import { storage } from "@/lib/storage";
import { insertHelpRequestSchema } from "@shared/schema";

export async function GET() {
  try {
    const requests = await storage.getHelpRequests();
    return Response.json(requests);
  } catch (error) {
    console.error("Error fetching help requests:", error);
    return Response.json({ message: "Failed to fetch help requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = insertHelpRequestSchema.parse(body);
    const helpRequest = await storage.createHelpRequest(parsed);

    const suggestedProjects = await storage.searchSimilarProjects(
      `${parsed.title} ${parsed.description}`,
      3
    );
    const suggestedPeople = await storage.suggestPeople(
      `${parsed.title} ${parsed.description}`,
      parsed.team
    );

    return Response.json(
      {
        helpRequest,
        suggestions: { projects: suggestedProjects, people: suggestedPeople },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Dados invalidos", errors: error.errors }, { status: 400 });
    }
    console.error("Error creating help request:", error);
    return Response.json({ message: "Failed to create help request" }, { status: 500 });
  }
}
