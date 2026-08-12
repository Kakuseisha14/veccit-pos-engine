"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setOnUnauthorizedHandler } from "@/lib/api";
import {
  HOME_BY_ROLE,
  type SessionTenant,
  type SessionUser,
} from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  tenant: SessionTenant | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tenant, setTenant] = useState<SessionTenant | null>(null);

  const clearSession = useCallback(() => {
    setUser(null);
    setTenant(null);
    setStatus("unauthenticated");
    router.replace("/signin");
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const session = await apiFetch<{
          user: SessionUser;
          tenant: SessionTenant | null;
        }>("/auth/me");
        if (cancelled) return;
        setUser(session.user);
        setTenant(session.tenant);
        setStatus("authenticated");
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Object && "status" in err && err.status === 401) {
          return;
        }
        setUser(null);
        setTenant(null);
        setStatus("unauthenticated");
      }
    };

    setOnUnauthorizedHandler(() => {
      clearSession();
    });
    void loadSession();

    return () => {
      cancelled = true;
      setOnUnauthorizedHandler(null);
    };
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await apiFetch<{
        user: SessionUser;
        tenant: SessionTenant | null;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(session.user);
      setTenant(session.tenant);
      setStatus("authenticated");
      router.replace(HOME_BY_ROLE[session.user.role]);
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // la cookie se limpia de todas formas en el cliente
    }
    clearSession();
  }, [clearSession]);

  const refreshSession = useCallback(async () => {
    try {
      const session = await apiFetch<{
        user: SessionUser;
        tenant: SessionTenant | null;
      }>("/auth/me");
      setUser(session.user);
      setTenant(session.tenant);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setTenant(null);
      setStatus("unauthenticated");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        tenant,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};