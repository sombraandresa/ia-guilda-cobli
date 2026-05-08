"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, ExternalLink, BookOpen } from "lucide-react";
import { type Training, getCategoryLabel } from "@shared/schema";

const CATEGORY_COLORS: Record<string, string> = {
  ferramenta: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  conceito: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  framework: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  plataforma: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  geral: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function Trainings() {
  const { data: trainingList, isLoading } = useQuery<Training[]>({
    queryKey: ["/api/trainings"],
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold" data-testid="text-trainings-title">Treinamentos</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Recursos de aprendizado para ferramentas e conceitos de IA e automacao.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-md" />
            ))}
          </div>
        ) : trainingList && trainingList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingList.map((training) => (
              <Card key={training.id} className="hover-elevate" data-testid={`card-training-${training.id}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <h3 className="font-medium text-sm leading-snug" data-testid={`text-training-title-${training.id}`}>
                        {training.title}
                      </h3>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs flex-shrink-0 ${CATEGORY_COLORS[training.category] || CATEGORY_COLORS.geral}`}
                    >
                      {getCategoryLabel(training.category)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {training.description}
                  </p>
                  <a href={training.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" data-testid={`link-training-${training.id}`}>
                      Acessar
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-muted-foreground" />
            <h3 className="font-medium text-sm">Nenhum treinamento disponivel</h3>
          </div>
        )}
      </div>
    </div>
  );
}
