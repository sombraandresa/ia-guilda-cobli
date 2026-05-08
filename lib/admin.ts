"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  loading: true,
  login: async () => false,
  logout: async () => {},
  refresh: async () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

export { AdminContext };

export function useAdminState(): AdminContextType {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/verify", { credentials: "same-origin" });
      setIsAdmin(res.ok);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (password: string): Promise<boolean> => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) return false;
      await refresh();
      return true;
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    setIsAdmin(false);
  }, []);

  return { isAdmin, loading, login, logout, refresh };
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...options.headers,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }
  return response;
}
