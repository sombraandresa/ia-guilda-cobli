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
import { type ProjectType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface TypeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function TypeSelect({ value, onValueChange, placeholder = "Selecione o tipo", allowClear = false, className, ...props }: TypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: typesList } = useQuery<ProjectType[]>({
    queryKey: ["/api/project-types"],
  });

  const createType = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/project-types", { name });
      return res.json();
    },
    onSuccess: (pt: ProjectType) => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-types"] });
      onValueChange(pt.name);
      setSearch("");
      setOpen(false);
    },
  });

  const allTypes = typesList || [];
  const filtered = search
    ? allTypes.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : allTypes;

  const exactMatch = allTypes.some((t) => t.name.toLowerCase() === search.toLowerCase());
  const canCreate = search.trim().length > 0 && !exactMatch;

  const handleCreate = () => {
    if (canCreate) {
      createType.mutate(search.trim());
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
              data-testid="button-clear-type"
            />
          ) : (
            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Buscar ou criar tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
            data-testid="input-type-search"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filtered.map((pt) => (
            <button
              key={pt.id}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover-elevate cursor-pointer"
              onClick={() => {
                onValueChange(pt.name);
                setSearch("");
                setOpen(false);
              }}
              data-testid={`option-type-${pt.name}`}
            >
              <Check className={cn("h-3.5 w-3.5 flex-shrink-0", value === pt.name ? "opacity-100" : "opacity-0")} />
              <span>{pt.name}</span>
            </button>
          ))}
          {filtered.length === 0 && !canCreate && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum tipo encontrado.</div>
          )}
        </div>
        {canCreate && (
          <div className="border-t p-1.5">
            <button
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover-elevate cursor-pointer rounded-md"
              onClick={handleCreate}
              disabled={createType.isPending}
              data-testid="button-create-type"
            >
              <Plus className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="text-primary font-medium">
                {createType.isPending ? "Criando..." : `Criar "${search.trim()}"`}
              </span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
