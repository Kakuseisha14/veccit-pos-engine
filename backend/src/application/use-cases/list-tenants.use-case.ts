import { Inject } from '@nestjs/common';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TENANT_REPOSITORY } from '../../domain/repositories/tenant.repository';
import type { TenantSummary } from '../dtos/tenant-management.dto';

export class ListTenantsUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(): Promise<TenantSummary[]> {
    const tenants = await this.tenantRepository.list();
    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      businessName: tenant.businessName,
      plan: tenant.plan,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }));
  }
}
