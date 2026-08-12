"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
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
  registerTenant: (input: {
    tenantName: string;
    tenantAdminName: string;
    email: string;
    password: string;
    businessName?: string;
    phone?: string;
  }) => Promise<void>;
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
      } catch {
        if (cancelled) return;
        setUser(null);
        setTenant(null);
        setStatus("unauthenticated");
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const registerTenant = useCallback(
    async (input: {
      tenantName: string;
      tenantAdminName: string;
      email: string;
      password: string;
      businessName?: string;
      phone?: string;
    }) => {
      await apiFetch("/auth/register-tenant", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await login(input.email, input.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    setUser(null);
    setTenant(null);
    setStatus("unauthenticated");
    router.replace("/signin");
  }, [router]);

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
        registerTenant,
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