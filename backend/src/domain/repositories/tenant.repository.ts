import type { Tenant } from '../entities/tenant.entity';

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByEmail(email: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<Tenant>;
}

export const TENANT_REPOSITORY = Symbol('ITenantRepository');
