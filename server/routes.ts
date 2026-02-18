import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHelpRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/projects", async (req, res) => {
    try {
      const filters = {
        q: req.query.q as string | undefined,
        tag: req.query.tag as string | undefined,
        team: req.query.team as string | undefined,
        status: req.query.status as string | undefined,
        type: req.query.type as string | undefined,
      };
      const projects = await storage.getProjects(filters);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get("/api/tags", async (_req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.get("/api/help-requests", async (_req, res) => {
    try {
      const requests = await storage.getHelpRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching help requests:", error);
      res.status(500).json({ message: "Failed to fetch help requests" });
    }
  });

  app.post("/api/help-requests", async (req, res) => {
    try {
      const parsed = insertHelpRequestSchema.parse(req.body);
      const helpRequest = await storage.createHelpRequest(parsed);

      const suggestedProjects = await storage.searchSimilarProjects(
        `${parsed.title} ${parsed.description}`,
        3
      );
      const suggestedPeople = await storage.suggestPeople(
        `${parsed.title} ${parsed.description}`,
        parsed.team
      );

      res.status(201).json({
        helpRequest,
        suggestions: {
          projects: suggestedProjects,
          people: suggestedPeople,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados invalidos", errors: error.errors });
      }
      console.error("Error creating help request:", error);
      res.status(500).json({ message: "Failed to create help request" });
    }
  });

  return httpServer;
}
