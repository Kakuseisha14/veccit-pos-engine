import { apiFetch } from "./api";

export const TENANT_PLANS = ["FREE", "PRO"] as const;

export type TenantPlan = (typeof TENANT_PLANS)[number];

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  plan: TenantPlan;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantPayload {
  tenantName: string;
  tenantAdminName: string;
  email: string;
  password: string;
  phone?: string;
  businessName?: string;
  plan?: TenantPlan;
}

export interface UpdateTenantPayload {
  plan?: TenantPlan;
  isActive?: boolean;
}

export const TENANT_PLAN_LABELS: Record<TenantPlan, string> = {
  FREE: "Gratis",
  PRO: "Profesional",
};

export function listTenants(): Promise<Tenant[]> {
  return apiFetch<Tenant[]>("/tenants");
}

export function createTenant(
  payload: CreateTenantPayload,
): Promise<{ tenant: { id: string; name: string; plan: string }; user: unknown }> {
  return apiFetch("/auth/register-tenant", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTenant(
  id: string,
  payload: UpdateTenantPayload,
): Promise<{ tenant: Tenant }> {
  return apiFetch<{ tenant: Tenant }>(`/tenants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}