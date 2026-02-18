import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { type Project, PROJECT_STATUSES, PROJECT_TYPES, getStatusLabel, getTypeLabel } from "@shared/schema";
import { TeamSelect } from "@/components/team-select";
import { ProjectCard } from "@/components/project-card";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 6;

export default function Projects() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const params = new URLSearchParams();
  if (searchQuery) params.set("q", searchQuery);
  if (selectedTeam) params.set("team", selectedTeam);
  if (selectedStatus) params.set("status", selectedStatus);
  if (selectedType) params.set("type", selectedType);

  const queryString = params.toString();

  const projectsUrl = queryString ? `/api/projects?${queryString}` : "/api/projects";
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: [projectsUrl],
  });

  const hasFilters = selectedTeam || selectedStatus || selectedType;

  const clearFilters = () => {
    setSelectedTeam("");
    setSelectedStatus("");
    setSelectedType("");
    setPage(1);
  };

  const totalProjects = projects?.length || 0;
  const totalPages = Math.ceil(totalProjects / PAGE_SIZE);
  const paginatedProjects = projects?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || [];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold" data-testid="text-projects-title">Projetos</h1>
          <p className="text-muted-foreground text-sm">
            Todos os projetos de IA e automacao da guilda.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-10"
              data-testid="input-search-projects"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <TeamSelect
            value={selectedTeam}
            onValueChange={(v) => { setSelectedTeam(v); setPage(1); }}
            placeholder="Time"
            allowClear
            className="w-[140px]"
            data-testid="select-team-projects"
          />

          <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]" data-testid="select-status-projects">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]" data-testid="select-type-projects">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{getTypeLabel(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters-projects">
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground" data-testid="text-projects-count">
          {totalProjects} projeto{totalProjects !== 1 ? "s" : ""}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-md" />
            ))}
          </div>
        ) : paginatedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <h3 className="font-medium text-sm">Nenhum projeto encontrado</h3>
            <p className="text-xs text-muted-foreground">Tente ajustar os filtros.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
