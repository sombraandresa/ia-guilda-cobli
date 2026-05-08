"use client";

import { Home, FolderKanban, HelpCircle, Brain, GraduationCap, Shield, Plus } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ProjectFormDialog } from "@/components/project-form-dialog";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Projetos", url: "/projetos", icon: FolderKanban },
  { title: "Treinamentos", url: "/treinamentos", icon: GraduationCap },
  { title: "Pedir Ajuda", url: "/ajuda", icon: HelpCircle },
];

export function AppSidebar() {
  const location = usePathname() || "/";
  const [projectFormOpen, setProjectFormOpen] = useState(false);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight" data-testid="text-app-title">AI Guilda</h1>
              <p className="text-xs text-muted-foreground leading-tight">Cobli</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? location === "/"
                    : location.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isActive ? "bg-sidebar-accent" : ""}
                    >
                      <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Acoes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setProjectFormOpen(true)} data-testid="button-submit-project">
                  <Plus className="w-4 h-4" />
                  <span>Submeter Projeto</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  data-active={location.startsWith("/admin")}
                  className={location.startsWith("/admin") ? "bg-sidebar-accent" : ""}
                >
                  <Link href="/admin/login" data-testid="link-nav-admin">
                    <Shield className="w-4 h-4" />
                    <span>Painel Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <p className="text-xs text-muted-foreground">AI Guilda v1.0</p>
      </SidebarFooter>

      <ProjectFormDialog
        open={projectFormOpen}
        onOpenChange={setProjectFormOpen}
      />
    </Sidebar>
  );
}