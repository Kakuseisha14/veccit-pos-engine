import type { TenantPlan } from '../../domain/value-objects/tenant-plan';

export interface TenantSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  plan: TenantPlan;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTenantInput {
  tenantId: string;
  plan?: TenantPlan;
  isActive?: boolean;
}

export interface UpdateTenantOutput {
  tenant: TenantSummary;
}
