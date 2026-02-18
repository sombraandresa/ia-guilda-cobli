import {
  type Project, type InsertProject,
  type HelpRequest, type InsertHelpRequest,
  projects, helpRequests,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, sql, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getProjects(filters?: {
    q?: string;
    tag?: string;
    team?: string;
    status?: string;
    type?: string;
  }): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  getAllTags(): Promise<string[]>;
  getHelpRequests(): Promise<HelpRequest[]>;
  getHelpRequest(id: string): Promise<HelpRequest | undefined>;
  createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest>;
  searchSimilarProjects(query: string, limit?: number): Promise<Project[]>;
  suggestPeople(query: string, team?: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(filters?: {
    q?: string;
    tag?: string;
    team?: string;
    status?: string;
    type?: string;
  }): Promise<Project[]> {
    let allProjects = await db.select().from(projects).orderBy(desc(projects.lastUpdated));

    if (filters) {
      if (filters.q) {
        const q = filters.q.toLowerCase();
        allProjects = allProjects.filter((p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.problem.toLowerCase().includes(q) ||
          p.solution.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (filters.tag) {
        allProjects = allProjects.filter((p) =>
          p.tags.some((t) => t.toLowerCase() === filters.tag!.toLowerCase())
        );
      }
      if (filters.team) {
        allProjects = allProjects.filter((p) => p.team === filters.team);
      }
      if (filters.status) {
        allProjects = allProjects.filter((p) => p.status === filters.status);
      }
      if (filters.type) {
        allProjects = allProjects.filter((p) => p.type === filters.type);
      }
    }

    return allProjects;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async getAllTags(): Promise<string[]> {
    const allProjects = await db.select({ tags: projects.tags }).from(projects);
    const tagSet = new Set<string>();
    allProjects.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }

  async getHelpRequests(): Promise<HelpRequest[]> {
    return db.select().from(helpRequests).orderBy(desc(helpRequests.createdAt));
  }

  async getHelpRequest(id: string): Promise<HelpRequest | undefined> {
    const [request] = await db.select().from(helpRequests).where(eq(helpRequests.id, id));
    return request;
  }

  async createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest> {
    const similarProjects = await this.searchSimilarProjects(
      `${request.title} ${request.description}`,
      3
    );
    const suggestedPeople = await this.suggestPeople(
      `${request.title} ${request.description}`,
      request.team
    );

    const [created] = await db
      .insert(helpRequests)
      .values({
        ...request,
        suggestedProjects: similarProjects.map((p) => p.id),
        suggestedPeople: suggestedPeople,
      })
      .returning();

    return created;
  }

  async searchSimilarProjects(query: string, limit = 3): Promise<Project[]> {
    const allProjects = await db.select().from(projects);
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 2);

    const scored = allProjects.map((project) => {
      let score = 0;
      const searchableText = [
        project.title,
        project.summary,
        project.problem,
        project.solution,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase();

      for (const word of words) {
        if (searchableText.includes(word)) {
          score += 1;
          if (project.problem.toLowerCase().includes(word)) score += 2;
          if (project.title.toLowerCase().includes(word)) score += 1.5;
          if (project.tags.some((t) => t.toLowerCase().includes(word))) score += 1;
        }
      }
      return { project, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.project);
  }

  async suggestPeople(query: string, team?: string): Promise<string[]> {
    const allProjects = await db.select().from(projects);
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 2);

    const ownerScores = new Map<string, number>();

    for (const project of allProjects) {
      const searchableText = [
        project.title,
        project.summary,
        project.problem,
        project.solution,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const word of words) {
        if (searchableText.includes(word)) score += 1;
      }

      if (team && project.team === team) score += 2;

      if (score > 0) {
        const current = ownerScores.get(project.owner) || 0;
        ownerScores.set(project.owner, current + score);
      }
    }

    return Array.from(ownerScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([owner]) => owner);
  }
}

export const storage = new DatabaseStorage();
