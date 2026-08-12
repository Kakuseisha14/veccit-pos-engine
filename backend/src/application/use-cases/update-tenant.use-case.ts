import { Inject } from '@nestjs/common';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TENANT_REPOSITORY } from '../../domain/repositories/tenant.repository';
import { TenantNotFoundException } from '../../domain/exceptions/tenant-not-found.exception';
import type {
  UpdateTenantInput,
  UpdateTenantOutput,
} from '../dtos/tenant-management.dto';

export class UpdateTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(input: UpdateTenantInput): Promise<UpdateTenantOutput> {
    const tenant = await this.tenantRepository.findById(input.tenantId);
    if (!tenant) {
      throw new TenantNotFoundException(input.tenantId);
    }

    let updated = tenant;
    if (input.plan !== undefined) {
      updated = updated.withPlan(input.plan);
    }
    if (input.isActive !== undefined) {
      updated = updated.withStatus(input.isActive);
    }

    await this.tenantRepository.save(updated);

    return {
      tenant: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        businessName: updated.businessName,
        plan: updated.plan,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  }
}
