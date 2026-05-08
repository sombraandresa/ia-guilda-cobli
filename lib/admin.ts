"use client";

import { useState, useEffect, createContext, useContext } from "react";

interface AdminContextType {
  token: string | null;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  token: null,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

export { AdminContext };

export function useAdminState() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("admin-token");
  });

  const isAdmin = !!token;

  const login = (newToken: string) => {
    localStorage.setItem("admin-token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("admin-token");
    setToken(null);
  };

  return { token, isAdmin, login, logout };
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("admin-token");
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (response.status === 401 && token) {
    localStorage.removeItem("admin-token");
    window.location.href = "/admin/login";
  }
  return response;
}