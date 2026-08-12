import { apiFetch, apiFormFetch } from "./api";
import type { Role } from "./roles";

export interface User {
  id: string;
  tenantId: string | null;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  avatarUrl: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserPayload {
  name?: string;
  role?: Role;
}

export const USER_ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super admin",
  TENANT_ADMIN: "Administrador",
  CASHIER: "Cajero",
};

export const CREATABLE_ROLES: Role[] = ["CASHIER", "TENANT_ADMIN"];

export function listUsers(): Promise<{ users: User[] }> {
  return apiFetch<{ users: User[] }>("/users");
}

export function createUser(
  payload: CreateUserPayload,
): Promise<{ user: User }> {
  return apiFetch<{ user: User }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<{ user: User }> {
  return apiFetch<{ user: User }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function setUserActive(
  id: string,
  isActive: boolean,
): Promise<{ user: User }> {
  return apiFetch<{ user: User }>(`/users/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function uploadUserAvatar(
  id: string,
  file: File,
): Promise<{ user: User }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFormFetch<{ user: User }>(`/users/${id}/avatar`, formData, "PATCH");
}