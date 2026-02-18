import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, LogOut, Plus, Pencil, Trash2, FolderKanban, HelpCircle, GraduationCap, Save } from "lucide-react";
import { type Project, type HelpRequest, type Training, getStatusLabel, getTypeLabel, getHelpStatusLabel, getUrgencyLabel, HELP_STATUSES, getCategoryLabel } from "@shared/schema";
import { STATUS_COLORS, URGENCY_COLORS } from "@/lib/constants";
import { useAdmin, adminFetch } from "@/lib/admin";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TRAINING_CATEGORIES } from "@shared/schema";

const HELP_STATUS_COLORS: Record<string, string> = {
  aberto: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  em_andamento: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  concluido: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

export default function Admin() {
  const { isAdmin, logout } = useAdmin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [trainingFormOpen, setTrainingFormOpen] = useState(false);
  const [editTraining, setEditTraining] = useState<Training | null>(null);
  const [trainingTitle, setTrainingTitle] = useState("");
  const [trainingDesc, setTrainingDesc] = useState("");
  const [trainingLink, setTrainingLink] = useState("");
  const [trainingCategory, setTrainingCategory] = useState("geral");

  const { data: projectsList } = useQuery<Project[]>({ queryKey: ["/api/projects"], enabled: isAdmin });
  const { data: helpRequestsList } = useQuery<HelpRequest[]>({ queryKey: ["/api/help-requests"], enabled: isAdmin });
  const { data: trainingsList } = useQuery<Training[]>({ queryKey: ["/api/trainings"], enabled: isAdmin });

  const updateHelpStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await adminFetch(`/api/help-requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Falha");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
      toast({ title: "Status atualizado!" });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      toast({ title: "Projeto deletado!" });
    },
  });

  const saveTraining = useMutation({
    mutationFn: async () => {
      const body = { title: trainingTitle, description: trainingDesc, link: trainingLink, category: trainingCategory };
      if (editTraining) {
        const res = await adminFetch(`/api/trainings/${editTraining.id}`, { method: "PATCH", body: JSON.stringify(body) });
        if (!res.ok) throw new Error("Falha");
        return res.json();
      } else {
        const res = await adminFetch("/api/trainings", { method: "POST", body: JSON.stringify(body) });
        if (!res.ok) throw new Error("Falha");
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({ title: editTraining ? "Treinamento atualizado!" : "Treinamento criado!" });
      setTrainingFormOpen(false);
      resetTrainingForm();
    },
  });

  const deleteTraining = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/trainings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({ title: "Treinamento deletado!" });
    },
  });

  const resetTrainingForm = () => {
    setTrainingTitle("");
    setTrainingDesc("");
    setTrainingLink("");
    setTrainingCategory("geral");
    setEditTraining(null);
  };

  const openEditTraining = (t: Training) => {
    setEditTraining(t);
    setTrainingTitle(t.title);
    setTrainingDesc(t.description);
    setTrainingLink(t.link);
    setTrainingCategory(t.category);
    setTrainingFormOpen(true);
  };

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold" data-testid="text-admin-title">Painel Admin</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-admin-logout">
            <LogOut className="w-4 h-4 mr-1" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="projects">
          <TabsList>
            <TabsTrigger value="projects" data-testid="tab-admin-projects">
              <FolderKanban className="w-4 h-4 mr-1" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="help" data-testid="tab-admin-help">
              <HelpCircle className="w-4 h-4 mr-1" />
              Ajuda
            </TabsTrigger>
            <TabsTrigger value="trainings" data-testid="tab-admin-trainings">
              <GraduationCap className="w-4 h-4 mr-1" />
              Treinamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditProject(null); setProjectFormOpen(true); }} data-testid="button-admin-new-project">
                <Plus className="w-4 h-4 mr-1" />
                Novo Projeto
              </Button>
            </div>

            <div className="space-y-2">
              {(projectsList || []).map((project) => (
                <Card key={project.id} data-testid={`card-admin-project-${project.id}`}>
                  <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{project.title}</p>
                        <p className="text-xs text-muted-foreground">{project.team} - {project.owner}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={STATUS_COLORS[project.status] || ""}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      <Button size="icon" variant="ghost" onClick={() => { setEditProject(project); setProjectFormOpen(true); }} data-testid={`button-edit-project-${project.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" data-testid={`button-delete-project-${project.id}`}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar projeto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar "{project.title}"? Esta acao nao pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProject.mutate(project.id)} data-testid="button-confirm-delete">
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <div className="space-y-2">
              {(helpRequestsList || []).map((req) => (
                <Card key={req.id} data-testid={`card-admin-help-${req.id}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-medium">{req.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{req.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>{req.requester} - {req.team}</span>
                          <Badge variant="secondary" className={URGENCY_COLORS[req.urgency] || ""}>
                            {getUrgencyLabel(req.urgency)}
                          </Badge>
                          <span>{format(new Date(req.createdAt), "dd MMM yyyy", { locale: ptBR })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Select
                          value={req.status}
                          onValueChange={(status) => updateHelpStatus.mutate({ id: req.id, status })}
                        >
                          <SelectTrigger className="w-[140px]" data-testid={`select-help-status-${req.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HELP_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{getHelpStatusLabel(s)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!helpRequestsList || helpRequestsList.length === 0) && (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  Nenhum pedido de ajuda registrado.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trainings" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { resetTrainingForm(); setTrainingFormOpen(true); }} data-testid="button-admin-new-training">
                <Plus className="w-4 h-4 mr-1" />
                Novo Treinamento
              </Button>
            </div>

            <div className="space-y-2">
              {(trainingsList || []).map((training) => (
                <Card key={training.id} data-testid={`card-admin-training-${training.id}`}>
                  <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{training.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{training.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getCategoryLabel(training.category)}</Badge>
                      <Button size="icon" variant="ghost" onClick={() => openEditTraining(training)} data-testid={`button-edit-training-${training.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" data-testid={`button-delete-training-${training.id}`}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deletar treinamento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar "{training.title}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTraining.mutate(training.id)}>
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <ProjectFormDialog
          open={projectFormOpen}
          onOpenChange={setProjectFormOpen}
          editProject={editProject}
          isAdmin={true}
        />

        <Dialog open={trainingFormOpen} onOpenChange={setTrainingFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editTraining ? "Editar Treinamento" : "Novo Treinamento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Titulo</label>
                <Input value={trainingTitle} onChange={(e) => setTrainingTitle(e.target.value)} data-testid="input-training-title" />
              </div>
              <div>
                <label className="text-sm font-medium">Descricao</label>
                <Textarea value={trainingDesc} onChange={(e) => setTrainingDesc(e.target.value)} className="resize-none min-h-[80px]" data-testid="input-training-desc" />
              </div>
              <div>
                <label className="text-sm font-medium">Link</label>
                <Input value={trainingLink} onChange={(e) => setTrainingLink(e.target.value)} placeholder="https://..." data-testid="input-training-link" />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria</label>
                <Select value={trainingCategory} onValueChange={setTrainingCategory}>
                  <SelectTrigger data-testid="select-training-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRAINING_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{getCategoryLabel(c)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => saveTraining.mutate()} disabled={!trainingTitle || !trainingDesc || !trainingLink || saveTraining.isPending} data-testid="button-save-training">
                  <Save className="w-4 h-4 mr-1" />
                  {saveTraining.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
