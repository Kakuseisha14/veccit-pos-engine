"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { HOME_BY_ROLE } from "@/lib/auth";
import type { Role } from "@/lib/roles";

export const RoleGuard: React.FC<{
  allowedRoles: Role[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { status, user } = useAuth();
  const router = useRouter();

  const isAllowed = user !== null && allowedRoles.includes(user.role);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isAllowed) {
      router.replace(user ? HOME_BY_ROLE[user.role] : "/signin");
    }
  }, [status, isAllowed, user, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return isAllowed ? <>{children}</> : null;
};