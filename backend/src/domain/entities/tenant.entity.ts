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

  withPlan(plan: TenantPlan): Tenant {
    return new Tenant(
      this.id,
      this.name,
      this.email,
      this.phone,
      this.businessName,
      plan,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  withStatus(isActive: boolean): Tenant {
    return new Tenant(
      this.id,
      this.name,
      this.email,
      this.phone,
      this.businessName,
      this.plan,
      isActive,
      this.createdAt,
      new Date(),
    );
  }

  withProfile(input: {
    name?: string;
    phone?: string | null;
    businessName?: string | null;
  }): Tenant {
    return new Tenant(
      this.id,
      input.name !== undefined ? input.name.trim() : this.name,
      this.email,
      input.phone !== undefined ? input.phone?.trim() || null : this.phone,
      input.businessName !== undefined
        ? input.businessName?.trim() || null
        : this.businessName,
      this.plan,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }
}
