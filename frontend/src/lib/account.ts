import { apiFetch } from "./api";

export function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ user: { id: string; email: string } }> {
  return apiFetch("/auth/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export interface UpdateTenantProfilePayload {
  name?: string;
  phone?: string;
  businessName?: string;
}

export function updateTenantProfile(
  payload: UpdateTenantProfilePayload,
): Promise<{
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    businessName: string | null;
    plan: string;
  };
}> {
  return apiFetch("/tenants/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}