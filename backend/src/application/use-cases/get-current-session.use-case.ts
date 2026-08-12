import { Inject } from '@nestjs/common';
import type { SessionTenant, SessionUser } from '../dtos/register-tenant.dto';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TENANT_REPOSITORY } from '../../domain/repositories/tenant.repository';
import type { TokenPayload } from '../services/token.service';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

export interface GetCurrentSessionOutput {
  user: SessionUser;
  tenant: SessionTenant | null;
}

export class GetCurrentSessionUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(payload: TokenPayload): Promise<GetCurrentSessionOutput> {
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UserNotFoundException();
    }

    let tenant: SessionTenant | null = null;
    if (user.tenantId) {
      const found = await this.tenantRepository.findById(user.tenantId);
      if (found) {
        tenant = { id: found.id, name: found.name, plan: found.plan };
      }
    }

    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      tenant,
    };
  }
}
