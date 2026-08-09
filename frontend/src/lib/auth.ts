import type { Role } from "./roles";

export interface SessionUser {
  id: string;
  tenantId: string | null;
  name: string;
  email: string;
  role: Role;
}

export interface SessionTenant {
  id: string;
  name: string;
  plan: string;
}

export interface LoginResponse {
  user: SessionUser;
  tenant: SessionTenant | null;
}

export interface RegisterTenantResponse {
  tenant: SessionTenant;
  user: SessionUser;
}

export const HOME_BY_ROLE: Record<Role, string> = {
  SUPER_ADMIN: "/",
  TENANT_ADMIN: "/",
  CASHIER: "/",
};