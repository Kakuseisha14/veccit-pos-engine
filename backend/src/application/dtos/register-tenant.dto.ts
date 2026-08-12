import type { Role } from '../../domain/value-objects/role';

export interface SessionUser {
  id: string;
  tenantId: string | null;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
}

export interface SessionTenant {
  id: string;
  name: string;
  plan: string;
}

export interface RegisterTenantInput {
  tenantName: string;
  email: string;
  password: string;
  tenantAdminName: string;
  phone?: string | null;
  businessName?: string | null;
}

export interface RegisterTenantOutput {
  tenant: SessionTenant;
  user: SessionUser;
}
