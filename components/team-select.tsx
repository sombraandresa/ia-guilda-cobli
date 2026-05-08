"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { type Team } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface TeamSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function TeamSelect({ value, onValueChange, placeholder = "Selecione o time", allowClear = false, className, ...props }: TeamSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: teamsList } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/teams", { name });
      return res.json();
    },
    onSuccess: (team: Team) => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      onValueChange(team.name);
      setSearch("");
      setOpen(false);
    },
  });

  const allTeams = teamsList || [];
  const filtered = search
    ? allTeams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : allTeams;

  const exactMatch = allTeams.some((t) => t.name.toLowerCase() === search.toLowerCase());
  const canCreate = search.trim().length > 0 && !exactMatch;

  const handleCreate = () => {
    if (canCreate) {
      createTeam.mutate(search.trim());
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between font-normal", className || "w-full")}
          data-testid={props["data-testid"]}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          {allowClear && value ? (
            <X
              className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onValueChange("");
              }}
              data-testid="button-clear-team"
            />
          ) : (
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Buscar ou criar time..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            data-testid="input-team-search"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filtered.map((team) => (
            <button
              key={team.id}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover-elevate cursor-pointer"
              onClick={() => {
                onValueChange(team.name);
                setSearch("");
                setOpen(false);
              }}
              data-testid={`option-team-${team.name}`}
            >
              <Check className={cn("h-3.5 w-3.5 flex-shrink-0", value === team.name ? "opacity-100" : "opacity-0")} />
              <span>{team.name}</span>
            </button>
          ))}
          {filtered.length === 0 && !canCreate && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum time encontrado.</div>
          )}
        </div>
        {canCreate && (
          <div className="border-t p-1.5">
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover-elevate cursor-pointer rounded-md"
              onClick={handleCreate}
              disabled={createTeam.isPending}
              data-testid="button-create-team"
            >
              <Plus className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-primary font-medium">
                {createTeam.isPending ? "Criando..." : `Criar "${search.trim()}"`}
              </span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}