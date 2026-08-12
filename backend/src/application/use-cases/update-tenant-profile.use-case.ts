import { Inject } from '@nestjs/common';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TENANT_REPOSITORY } from '../../domain/repositories/tenant.repository';
import { TenantNotFoundException } from '../../domain/exceptions/tenant-not-found.exception';

export interface UpdateTenantProfileInput {
  tenantId: string;
  name?: string;
  phone?: string | null;
  businessName?: string | null;
}

export interface UpdateTenantProfileOutput {
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    businessName: string | null;
    plan: string;
  };
}

export class UpdateTenantProfileUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(
    input: UpdateTenantProfileInput,
  ): Promise<UpdateTenantProfileOutput> {
    const tenant = await this.tenantRepository.findById(input.tenantId);
    if (!tenant) {
      throw new TenantNotFoundException(input.tenantId);
    }

    const hasChanges =
      input.name !== undefined ||
      input.phone !== undefined ||
      input.businessName !== undefined;

    const updated = hasChanges
      ? tenant.withProfile({
          name: input.name,
          phone: input.phone,
          businessName: input.businessName,
        })
      : tenant;

    if (hasChanges) {
      await this.tenantRepository.save(updated);
    }

    return {
      tenant: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        businessName: updated.businessName,
        plan: updated.plan,
      },
    };
  }
}
