import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, Brain, FolderKanban, HelpCircle, Sparkles } from "lucide-react";
import { type Project, PROJECT_STATUSES, PROJECT_TYPES, getStatusLabel, getTypeLabel } from "@shared/schema";
import { TeamSelect } from "@/components/team-select";
import { ProjectCard } from "@/components/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const params = new URLSearchParams();
  if (searchQuery) params.set("q", searchQuery);
  if (selectedTag) params.set("tag", selectedTag);
  if (selectedTeam) params.set("team", selectedTeam);
  if (selectedStatus) params.set("status", selectedStatus);
  if (selectedType) params.set("type", selectedType);

  const queryString = params.toString();

  const projectsUrl = queryString ? `/api/projects?${queryString}` : "/api/projects";
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: [projectsUrl],
  });

  const { data: allTags } = useQuery<string[]>({
    queryKey: ["/api/tags"],
  });

  const hasFilters = selectedTag || selectedTeam || selectedStatus || selectedType;

  const clearFilters = () => {
    setSelectedTag("");
    setSelectedTeam("");
    setSelectedStatus("");
    setSelectedType("");
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold" data-testid="text-home-title">AI Guilda</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Repositorio de projetos de IA e automacao da Cobli. Busque por problema, nao por palavra-chave.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Descreva o problema que voce quer resolver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[140px]" data-testid="select-tag">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              {(allTags || []).map((tag) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TeamSelect
            value={selectedTeam}
            onValueChange={setSelectedTeam}
            placeholder="Time"
            allowClear
            className="w-[140px]"
            data-testid="select-team"
          />

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px]" data-testid="select-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px]" data-testid="select-type">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-md" />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                {projects.length} projeto{projects.length !== 1 ? "s" : ""} encontrado{projects.length !== 1 ? "s" : ""}
              </p>
              <Link href="/projetos">
                <Button variant="ghost" size="sm" data-testid="link-see-all-projects">
                  <FolderKanban className="w-4 h-4 mr-1" />
                  Ver todos
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-muted">
              <Brain className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm">Nenhum projeto encontrado</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Tente ajustar os filtros ou buscar por um problema diferente.
            </p>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Link href="/ajuda">
            <Button data-testid="button-ask-help-home">
              <HelpCircle className="w-4 h-4 mr-2" />
              Pedir ajuda a guilda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
