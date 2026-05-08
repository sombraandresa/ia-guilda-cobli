"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminContext, useAdminState } from "@/lib/admin";

export function Providers({ children }: { children: React.ReactNode }) {
  const adminState = useAdminState();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AdminContext.Provider value={adminState}>
          <TooltipProvider>
            <SidebarProvider style={style}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1 min-w-0">
                  <header className="flex items-center justify-between gap-2 p-2 border-b sticky top-0 bg-background z-50">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <ThemeToggle />
                  </header>
                  <main className="flex-1 overflow-hidden flex flex-col">
                    {children}
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </AdminContext.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
