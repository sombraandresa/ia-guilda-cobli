import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  GitBranch,
  Workflow,
  BarChart3,
  HelpCircle,
  User,
  Calendar,
  AlertTriangle,
  Database,
  Target,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { type Project, getStatusLabel, getTypeLabel } from "@shared/schema";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function LinkButton({ href, icon: Icon, label }: { href?: string; icon: typeof FileText; label: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="sm" data-testid={`link-${label.toLowerCase()}`}>
        <Icon className="w-4 h-4 mr-1" />
        {label}
        <ExternalLink className="w-3 h-3 ml-1" />
      </Button>
    </a>
  );
}

function DetailSection({ icon: Icon, title, content }: { icon: typeof FileText; title: string; content?: string | null }) {
  if (!content) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pl-6">{content}</p>
    </div>
  );
}

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["/api/projects", params.id],
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
          <h2 className="font-medium">Projeto nao encontrado</h2>
          <Link href="/projetos">
            <Button variant="outline" size="sm" data-testid="button-back-not-found">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para projetos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusClass = STATUS_COLORS[project.status] || STATUS_COLORS.em_andamento;
  const links = project.links as { doc?: string; repo?: string; n8n?: string; dashboard?: string } | null;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/projetos">
            <Button variant="ghost" size="icon" data-testid="button-back-detail">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold" data-testid="text-project-detail-title">{project.title}</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className={statusClass} data-testid="badge-detail-status">
            {getStatusLabel(project.status)}
          </Badge>
          <Badge variant="outline" data-testid="badge-detail-type">
            {getTypeLabel(project.type)}
          </Badge>
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span data-testid="text-detail-owner">{project.owner}</span>
          </div>
          <span className="font-medium text-foreground/70">{project.team}</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(project.lastUpdated), "dd MMM yyyy", { locale: ptBR })}</span>
          </div>
        </div>

        {(links?.doc || links?.repo || links?.n8n || links?.dashboard) && (
          <div className="flex items-center gap-2 flex-wrap">
            <LinkButton href={links?.doc} icon={FileText} label="Doc" />
            <LinkButton href={links?.repo} icon={GitBranch} label="Repo" />
            <LinkButton href={links?.n8n} icon={Workflow} label="n8n" />
            <LinkButton href={links?.dashboard} icon={BarChart3} label="Dashboard" />
          </div>
        )}

        <Card>
          <CardContent className="p-5 space-y-5">
            <DetailSection icon={Lightbulb} title="Resumo" content={project.summary} />
            <DetailSection icon={AlertTriangle} title="Problema" content={project.problem} />
            <DetailSection icon={Target} title="Solucao" content={project.solution} />
            <DetailSection icon={Database} title="Dependencias de Dados" content={project.dataDependencies} />
            <DetailSection icon={AlertCircle} title="Riscos" content={project.risks} />
            <DetailSection icon={BarChart3} title="Metricas" content={project.metrics} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Link href={`/ajuda?projectId=${project.id}`}>
            <Button data-testid="button-ask-help-detail">
              <HelpCircle className="w-4 h-4 mr-2" />
              Pedir ajuda sobre este projeto
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
