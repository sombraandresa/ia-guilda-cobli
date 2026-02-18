import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const linksSchema = z.object({
  doc: z.string().optional(),
  repo: z.string().optional(),
  n8n: z.string().optional(),
  dashboard: z.string().optional(),
});

export type ProjectLinks = z.infer<typeof linksSchema>;

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  status: text("status").notNull().default("em_andamento"),
  type: text("type").notNull().default("automacao"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  team: text("team").notNull(),
  owner: text("owner").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  summary: text("summary").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  dataDependencies: text("data_dependencies").default(""),
  risks: text("risks").default(""),
  metrics: text("metrics").default(""),
  links: jsonb("links").$type<ProjectLinks>().default({}),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  lastUpdated: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const helpRequests = pgTable("help_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  urgency: text("urgency").notNull().default("media"),
  context: text("context").default(""),
  requester: text("requester").notNull(),
  team: text("team").notNull(),
  projectId: varchar("project_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("aberto"),
  suggestedProjects: text("suggested_projects").array().default(sql`'{}'::text[]`),
  suggestedPeople: text("suggested_people").array().default(sql`'{}'::text[]`),
});

export const insertHelpRequestSchema = createInsertSchema(helpRequests).omit({
  id: true,
  createdAt: true,
  suggestedProjects: true,
  suggestedPeople: true,
});

export type InsertHelpRequest = z.infer<typeof insertHelpRequestSchema>;
export type HelpRequest = typeof helpRequests.$inferSelect;

export const PROJECT_STATUSES = ["em_andamento", "concluido", "pausado", "planejado"] as const;
export const PROJECT_TYPES = ["automacao", "modelo_ml", "pipeline_dados", "chatbot", "dashboard", "integracao"] as const;
export const URGENCY_LEVELS = ["baixa", "media", "alta", "critica"] as const;
export const TEAMS = ["Data Science", "Engenharia", "Produto", "Operacoes", "CS", "Growth", "Financeiro"] as const;

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    em_andamento: "Em Andamento",
    concluido: "Concluido",
    pausado: "Pausado",
    planejado: "Planejado",
  };
  return map[status] || status;
}

export function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    automacao: "Automacao",
    modelo_ml: "Modelo ML",
    pipeline_dados: "Pipeline de Dados",
    chatbot: "Chatbot",
    dashboard: "Dashboard",
    integracao: "Integracao",
  };
  return map[type] || type;
}

export function getUrgencyLabel(urgency: string): string {
  const map: Record<string, string> = {
    baixa: "Baixa",
    media: "Media",
    alta: "Alta",
    critica: "Critica",
  };
  return map[urgency] || urgency;
}
