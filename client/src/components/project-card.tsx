import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Calendar, User, Zap, Brain, Database, MessageSquare, BarChart3, Plug } from "lucide-react";
import { type Project, getStatusLabel, getTypeLabel } from "@shared/schema";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeIcons: Record<string, typeof Zap> = {
  automacao: Zap,
  modelo_ml: Brain,
  pipeline_dados: Database,
  chatbot: MessageSquare,
  dashboard: BarChart3,
  integracao: Plug,
};

export function ProjectCard({ project }: { project: Project }) {
  const TypeIcon = typeIcons[project.type] || Zap;
  const statusClass = STATUS_COLORS[project.status] || STATUS_COLORS.em_andamento;

  return (
    <Link href={`/projetos/${project.id}`}>
      <Card
        className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200"
        data-testid={`card-project-${project.id}`}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted flex-shrink-0">
                <TypeIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm leading-snug line-clamp-2" data-testid={`text-project-title-${project.id}`}>
                {project.title}
              </h3>
            </div>
            <Badge
              variant="secondary"
              className={`text-xs flex-shrink-0 ${statusClass}`}
              data-testid={`badge-status-${project.id}`}
            >
              {getStatusLabel(project.status)}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.summary}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{project.tags.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{project.owner}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-foreground/70">{project.team}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {format(new Date(project.lastUpdated), "dd MMM yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
