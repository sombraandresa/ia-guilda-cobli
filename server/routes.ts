import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHelpRequestSchema, insertProjectSchema, insertTrainingSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";

const adminSessions = new Set<string>();

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ message: "Nao autorizado" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    if (password === adminPassword) {
      const token = randomUUID();
      adminSessions.add(token);
      return res.json({ token });
    }
    return res.status(401).json({ message: "Senha incorreta" });
  });

  app.post("/api/admin/logout", adminAuth, (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) adminSessions.delete(token);
    res.json({ message: "Logout realizado" });
  });

  app.get("/api/admin/verify", adminAuth, (_req, res) => {
    res.json({ valid: true });
  });

  app.get("/api/teams", async (_req, res) => {
    try {
      const result = await storage.getTeams();
      res.json(result);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "Nome do time obrigatorio" });
      }
      const team = await storage.createTeam(name.trim());
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.get("/api/project-types", async (_req, res) => {
    try {
      const result = await storage.getProjectTypes();
      res.json(result);
    } catch (error) {
      console.error("Error fetching project types:", error);
      res.status(500).json({ message: "Failed to fetch project types" });
    }
  });

  app.post("/api/project-types", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "Nome do tipo obrigatorio" });
      }
      const projectType = await storage.createProjectType(name.trim());
      res.status(201).json(projectType);
    } catch (error) {
      console.error("Error creating project type:", error);
      res.status(500).json({ message: "Failed to create project type" });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const filters = {
        q: req.query.q as string | undefined,
        tag: req.query.tag as string | undefined,
        team: req.query.team as string | undefined,
        status: req.query.status as string | undefined,
        type: req.query.type as string | undefined,
      };
      const result = await storage.getProjects(filters);
      res.json(result);
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

  app.post("/api/projects", async (req, res) => {
    try {
      const parsed = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(parsed);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados invalidos", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", adminAuth, async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", adminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Project deleted" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
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

  app.patch("/api/help-requests/:id/status", adminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await storage.updateHelpRequestStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ message: "Help request not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating help request:", error);
      res.status(500).json({ message: "Failed to update help request" });
    }
  });

  app.get("/api/trainings", async (_req, res) => {
    try {
      const result = await storage.getTrainings();
      res.json(result);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      res.status(500).json({ message: "Failed to fetch trainings" });
    }
  });

  app.post("/api/trainings", adminAuth, async (req, res) => {
    try {
      const parsed = insertTrainingSchema.parse(req.body);
      const training = await storage.createTraining(parsed);
      res.status(201).json(training);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados invalidos", errors: error.errors });
      }
      console.error("Error creating training:", error);
      res.status(500).json({ message: "Failed to create training" });
    }
  });

  app.patch("/api/trainings/:id", adminAuth, async (req, res) => {
    try {
      const updated = await storage.updateTraining(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Training not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating training:", error);
      res.status(500).json({ message: "Failed to update training" });
    }
  });

  app.delete("/api/trainings/:id", adminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteTraining(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Training not found" });
      }
      res.json({ message: "Training deleted" });
    } catch (error) {
      console.error("Error deleting training:", error);
      res.status(500).json({ message: "Failed to delete training" });
    }
  });

  return httpServer;
}
