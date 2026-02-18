import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { HelpCircle, Send, Sparkles, FolderKanban, User, CheckCircle2 } from "lucide-react";
import { URGENCY_LEVELS, getUrgencyLabel, type Project, insertHelpRequestSchema } from "@shared/schema";
import { URGENCY_COLORS, STATUS_COLORS } from "@/lib/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { getStatusLabel } from "@shared/schema";
import { TeamSelect } from "@/components/team-select";

const formSchema = insertHelpRequestSchema.extend({
  title: z.string().min(5, "Titulo deve ter pelo menos 5 caracteres"),
  description: z.string().min(10, "Descreva o problema com mais detalhes"),
  urgency: z.string().min(1, "Selecione a urgencia"),
  requester: z.string().min(2, "Informe seu nome"),
  team: z.string().min(1, "Selecione o time"),
});

type FormValues = z.infer<typeof formSchema>;

interface HelpResponse {
  helpRequest: {
    id: string;
    title: string;
    description: string;
    urgency: string;
    context: string | null;
    requester: string;
    team: string;
    projectId: string | null;
    status: string;
    suggestedProjects: string[];
    suggestedPeople: string[];
    createdAt: string;
  };
  suggestions: {
    projects: Project[];
    people: string[];
  };
}

export default function HelpRequest() {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const projectIdFromUrl = searchParams.get("projectId") || "";
  const { toast } = useToast();
  const [result, setResult] = useState<HelpResponse | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      urgency: "media",
      context: "",
      requester: "",
      team: "",
      projectId: projectIdFromUrl,
      status: "aberto",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/help-requests", values);
      return res.json();
    },
    onSuccess: (data: HelpResponse) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
      toast({
        title: "Pedido enviado!",
        description: "Seu pedido de ajuda foi registrado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  if (result) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold" data-testid="text-help-success">Pedido registrado!</h1>
              <p className="text-sm text-muted-foreground">Aqui estao algumas sugestoes para voce.</p>
            </div>
          </div>

          {result.suggestions.projects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-medium">Projetos Semelhantes</h2>
              </div>
              <div className="grid gap-3">
                {result.suggestions.projects.map((project) => (
                  <Link key={project.id} href={`/projetos/${project.id}`}>
                    <Card className="hover-elevate cursor-pointer" data-testid={`card-suggested-project-${project.id}`}>
                      <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <FolderKanban className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{project.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{project.summary}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className={STATUS_COLORS[project.status] || ""}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {result.suggestions.people.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-medium">Pessoas que podem ajudar</h2>
              </div>
              <div className="flex gap-2 flex-wrap">
                {result.suggestions.people.map((person) => (
                  <Card key={person} data-testid={`card-suggested-person-${person}`}>
                    <CardContent className="p-3 flex items-center gap-2">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{person}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setResult(null)} data-testid="button-new-request">
              Novo pedido
            </Button>
            <Link href="/">
              <Button variant="ghost" data-testid="button-back-home">Voltar ao inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold" data-testid="text-help-title">Pedir Ajuda</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Descreva seu problema e a guilda sugerira projetos relacionados e pessoas que podem ajudar.
          </p>
        </div>

        <Card>
          <CardContent className="p-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titulo do pedido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Preciso automatizar envio de emails..." {...field} data-testid="input-help-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descricao do problema</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o que voce precisa resolver, qual o contexto e o que ja tentou..."
                          className="resize-none min-h-[100px]"
                          {...field}
                          data-testid="input-help-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgencia</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-help-urgency">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {URGENCY_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>{getUrgencyLabel(level)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="team"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu time</FormLabel>
                        <FormControl>
                          <TeamSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            data-testid="select-help-team"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seu nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Joao Silva" {...field} data-testid="input-help-requester" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contexto adicional (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Links, prints, dados relevantes..."
                          className="resize-none min-h-[60px]"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-help-context"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={mutation.isPending} data-testid="button-submit-help">
                    <Send className="w-4 h-4 mr-2" />
                    {mutation.isPending ? "Enviando..." : "Enviar pedido"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
