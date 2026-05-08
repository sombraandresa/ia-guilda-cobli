import {
  type Project, type InsertProject,
  type HelpRequest, type InsertHelpRequest,
  type Training, type InsertTraining,
  type Team,
  projects, helpRequests, trainings, teams,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

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
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  getAllTags(): Promise<string[]>;
  getHelpRequests(): Promise<HelpRequest[]>;
  getHelpRequest(id: string): Promise<HelpRequest | undefined>;
  createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest>;
  updateHelpRequestStatus(id: string, status: string): Promise<HelpRequest | undefined>;
  searchSimilarProjects(query: string, limit?: number): Promise<Project[]>;
  suggestPeople(query: string, team?: string): Promise<string[]>;
  getTrainings(): Promise<Training[]>;
  createTraining(training: InsertTraining): Promise<Training>;
  updateTraining(id: string, training: Partial<InsertTraining>): Promise<Training | undefined>;
  deleteTraining(id: string): Promise<boolean>;
  getTeams(): Promise<Team[]>;
  createTeam(name: string): Promise<Team>;
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
        allProjects = allProjects.filter((p: Project) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.problem.toLowerCase().includes(q) ||
          p.solution.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.toLowerCase().includes(q))
        );
      }
      if (filters.tag) {
        allProjects = allProjects.filter((p: Project) =>
          p.tags.some((t: string) => t.toLowerCase() === filters.tag!.toLowerCase())
        );
      }
      if (filters.team) {
        allProjects = allProjects.filter((p: Project) => p.team === filters.team);
      }
      if (filters.status) {
        allProjects = allProjects.filter((p: Project) => p.status === filters.status);
      }
      if (filters.type) {
        allProjects = allProjects.filter((p: Project) => p.type === filters.type);
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

  async updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...data, lastUpdated: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async getAllTags(): Promise<string[]> {
    const allProjects = await db.select({ tags: projects.tags }).from(projects);
    const tagSet = new Set<string>();
    allProjects.forEach((p: { tags: string[] }) => p.tags.forEach((t: string) => tagSet.add(t)));
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
        suggestedProjects: similarProjects.map((p: Project) => p.id),
        suggestedPeople: suggestedPeople,
      })
      .returning();

    return created;
  }

  async updateHelpRequestStatus(id: string, status: string): Promise<HelpRequest | undefined> {
    const [updated] = await db
      .update(helpRequests)
      .set({ status })
      .where(eq(helpRequests.id, id))
      .returning();
    return updated;
  }

  async searchSimilarProjects(query: string, limit = 3): Promise<Project[]> {
    const allProjects = await db.select().from(projects);
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter((w: string) => w.length > 2);

    const scored = allProjects.map((project: Project) => {
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
          if (project.tags.some((t: string) => t.toLowerCase().includes(word))) score += 1;
        }
      }
      return { project, score };
    });

    return scored
      .filter((s: { score: number }) => s.score > 0)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, limit)
      .map((s: { project: Project }) => s.project);
  }

  async suggestPeople(query: string, team?: string): Promise<string[]> {
    const allProjects = await db.select().from(projects);
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter((w: string) => w.length > 2);

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
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 3)
      .map(([owner]: [string, number]) => owner);
  }

  async getTrainings(): Promise<Training[]> {
    return db.select().from(trainings).orderBy(desc(trainings.createdAt));
  }

  async createTraining(training: InsertTraining): Promise<Training> {
    const [created] = await db.insert(trainings).values(training).returning();
    return created;
  }

  async updateTraining(id: string, data: Partial<InsertTraining>): Promise<Training | undefined> {
    const [updated] = await db
      .update(trainings)
      .set(data)
      .where(eq(trainings.id, id))
      .returning();
    return updated;
  }

  async deleteTraining(id: string): Promise<boolean> {
    const result = await db.delete(trainings).where(eq(trainings.id, id)).returning();
    return result.length > 0;
  }

  async getTeams(): Promise<Team[]> {
    return db.select().from(teams).orderBy(asc(teams.name));
  }

  async createTeam(name: string): Promise<Team> {
    const existing = await db.select().from(teams).where(eq(teams.name, name));
    if (existing.length > 0) return existing[0];
    const [created] = await db.insert(teams).values({ name }).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
