"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, LogIn } from "lucide-react";
import { useAdmin } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAdmin();
  const router = useRouter();
  const { toast } = useToast();

  if (isAdmin) {
    router.push("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        login(data.token);
        router.push("/admin");
      } else {
        toast({
          title: "Erro",
          description: "Senha incorreta",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao conectar",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 justify-center">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold" data-testid="text-admin-login-title">Admin</h1>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Acesse o painel administrativo da AI Guilda.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="password"
              placeholder="Senha de admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="input-admin-password"
            />
            <Button type="submit" className="w-full" disabled={loading || !password} data-testid="button-admin-login">
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
