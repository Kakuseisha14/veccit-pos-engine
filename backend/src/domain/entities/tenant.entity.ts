import { randomUUID } from 'node:crypto';
import type { TenantPlan } from '../value-objects/tenant-plan';

export interface CreateTenantInput {
  name: string;
  email: string;
  phone?: string | null;
  businessName?: string | null;
  plan: TenantPlan;
}

export class Tenant {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string | null,
    public readonly businessName: string | null,
    public readonly plan: TenantPlan,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: CreateTenantInput): Tenant {
    const now = new Date();
    return new Tenant(
      randomUUID(),
      input.name.trim(),
      input.email.toLowerCase().trim(),
      input.phone?.trim() || null,
      input.businessName?.trim() || null,
      input.plan,
      true,
      now,
      now,
    );
  }
}
