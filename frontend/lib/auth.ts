"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, UserPrincipal } from "./types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  principal: UserPrincipal | null;
  setSession: (a: AuthResponse) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      principal: null,
      setSession: (a) =>
        set({ accessToken: a.accessToken, refreshToken: a.refreshToken, principal: a.principal }),
      clear: () => set({ accessToken: null, refreshToken: null, principal: null }),
    }),
    { name: "nexora-auth" }
  )
);

export function logoutAndGoHome() {
  if (typeof window !== "undefined") {
    useAuth.getState().clear();
    window.location.href = "/login";
  }
}

export function dashboardPath(role?: string) {
  switch (role) {
    case "ROLE_SUPER_ADMIN": return "/admin/dashboard";
    case "ROLE_NGO_ADMIN": return "/ngo/dashboard";
    case "ROLE_VOLUNTEER": return "/volunteer/dashboard";
    default: return "/";
  }
}