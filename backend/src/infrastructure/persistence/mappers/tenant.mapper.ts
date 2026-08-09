import { Tenant } from '../../../domain/entities/tenant.entity';
import type { TenantPlan } from '../../../domain/value-objects/tenant-plan';
import { TenantEntity } from '../entities/tenant.entity';

export function toDomainTenant(entity: TenantEntity): Tenant {
  return new Tenant(
    entity.id,
    entity.name,
    entity.email,
    entity.phone,
    entity.businessName,
    entity.plan as TenantPlan,
    entity.isActive,
    entity.createdAt,
    entity.updatedAt,
  );
}

export function toEntityTenant(tenant: Tenant): TenantEntity {
  const entity = new TenantEntity();
  entity.id = tenant.id;
  entity.name = tenant.name;
  entity.email = tenant.email;
  entity.phone = tenant.phone;
  entity.businessName = tenant.businessName;
  entity.plan = tenant.plan;
  entity.isActive = tenant.isActive;
  entity.createdAt = tenant.createdAt;
  entity.updatedAt = tenant.updatedAt;
  return entity;
}
