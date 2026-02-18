import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Save } from "lucide-react";
import { PROJECT_STATUSES, getStatusLabel, insertProjectSchema, type Project } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { TeamSelect } from "@/components/team-select";
import { TypeSelect } from "@/components/type-select";

const formSchema = insertProjectSchema.extend({
  title: z.string().min(3, "Titulo obrigatorio"),
  type: z.string().min(1, "Selecione o tipo"),
  summary: z.string().min(5, "Resumo obrigatorio"),
  problem: z.string().min(5, "Problema obrigatorio"),
  solution: z.string().min(5, "Solucao obrigatoria"),
  team: z.string().min(1, "Selecione o time"),
  owner: z.string().min(2, "Dono obrigatorio"),
  tagsInput: z.string().optional(),
  linkDoc: z.string().optional(),
  linkRepo: z.string().optional(),
  linkN8n: z.string().optional(),
  linkDashboard: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProject?: Project | null;
  isAdmin?: boolean;
}

export function ProjectFormDialog({ open, onOpenChange, editProject, isAdmin }: Props) {
  const { toast } = useToast();
  const links = editProject?.links as { doc?: string; repo?: string; n8n?: string; dashboard?: string } | null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editProject?.title || "",
      status: editProject?.status || "planejado",
      type: editProject?.type || "",
      team: editProject?.team || "",
      owner: editProject?.owner || "",
      summary: editProject?.summary || "",
      problem: editProject?.problem || "",
      solution: editProject?.solution || "",
      dataDependencies: editProject?.dataDependencies || "",
      risks: editProject?.risks || "",
      metrics: editProject?.metrics || "",
      tagsInput: editProject?.tags?.join(", ") || "",
      linkDoc: links?.doc || "",
      linkRepo: links?.repo || "",
      linkN8n: links?.n8n || "",
      linkDashboard: links?.dashboard || "",
    },
  });

  useEffect(() => {
    if (open) {
      const projectLinks = editProject?.links as { doc?: string; repo?: string; n8n?: string; dashboard?: string } | null;
      form.reset({
        title: editProject?.title || "",
        status: editProject?.status || "planejado",
        type: editProject?.type || "",
        team: editProject?.team || "",
        owner: editProject?.owner || "",
        summary: editProject?.summary || "",
        problem: editProject?.problem || "",
        solution: editProject?.solution || "",
        dataDependencies: editProject?.dataDependencies || "",
        risks: editProject?.risks || "",
        metrics: editProject?.metrics || "",
        tagsInput: editProject?.tags?.join(", ") || "",
        linkDoc: projectLinks?.doc || "",
        linkRepo: projectLinks?.repo || "",
        linkN8n: projectLinks?.n8n || "",
        linkDashboard: projectLinks?.dashboard || "",
      });
    }
  }, [open, editProject]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { tagsInput, linkDoc, linkRepo, linkN8n, linkDashboard, ...rest } = values;
      const tags = (tagsInput || "").split(",").map((t: string) => t.trim()).filter(Boolean);
      const projectLinks = {
        doc: linkDoc || undefined,
        repo: linkRepo || undefined,
        n8n: linkN8n || undefined,
        dashboard: linkDashboard || undefined,
      };
      const body = { ...rest, tags, links: projectLinks };

      if (editProject && isAdmin) {
        const res = await adminFetch(`/api/projects/${editProject.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Falha ao atualizar");
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/projects", body);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      toast({
        title: editProject ? "Projeto atualizado!" : "Projeto criado!",
        description: editProject ? "As alteracoes foram salvas." : "O novo projeto foi adicionado.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao salvar projeto.", variant: "destructive" });
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-project-form-title">
            {editProject ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Titulo</FormLabel>
                <FormControl><Input {...field} data-testid="input-project-title" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger data-testid="select-project-status"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <TypeSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      data-testid="select-project-type"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="team" render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <TeamSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      data-testid="select-project-team"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="owner" render={({ field }) => (
              <FormItem>
                <FormLabel>Dono</FormLabel>
                <FormControl><Input {...field} placeholder="Nome do responsavel" data-testid="input-project-owner" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="tagsInput" render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (separadas por virgula)</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} placeholder="NLP, automacao, ETL" data-testid="input-project-tags" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="summary" render={({ field }) => (
              <FormItem>
                <FormLabel>Resumo</FormLabel>
                <FormControl><Textarea {...field} className="resize-none min-h-[60px]" data-testid="input-project-summary" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="problem" render={({ field }) => (
              <FormItem>
                <FormLabel>Problema</FormLabel>
                <FormControl><Textarea {...field} className="resize-none min-h-[60px]" data-testid="input-project-problem" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="solution" render={({ field }) => (
              <FormItem>
                <FormLabel>Solucao</FormLabel>
                <FormControl><Textarea {...field} className="resize-none min-h-[60px]" data-testid="input-project-solution" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="dataDependencies" render={({ field }) => (
              <FormItem>
                <FormLabel>Dependencias de Dados</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} data-testid="input-project-deps" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="risks" render={({ field }) => (
              <FormItem>
                <FormLabel>Riscos</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} data-testid="input-project-risks" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="metrics" render={({ field }) => (
              <FormItem>
                <FormLabel>Metricas</FormLabel>
                <FormControl><Input {...field} value={field.value || ""} data-testid="input-project-metrics" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField control={form.control} name="linkDoc" render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Doc</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." data-testid="input-project-link-doc" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="linkRepo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Repo</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." data-testid="input-project-link-repo" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="linkN8n" render={({ field }) => (
                <FormItem>
                  <FormLabel>Link n8n</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." data-testid="input-project-link-n8n" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="linkDashboard" render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Dashboard</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="https://..." data-testid="input-project-link-dashboard" /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-project">
                <Save className="w-4 h-4 mr-2" />
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
