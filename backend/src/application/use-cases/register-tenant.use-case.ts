import { Inject } from '@nestjs/common';
import type {
  RegisterTenantInput,
  RegisterTenantOutput,
} from '../dtos/register-tenant.dto';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TENANT_REPOSITORY } from '../../domain/repositories/tenant.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IPasswordHasher } from '../services/password-hasher.service';
import { PASSWORD_HASHER } from '../services/password-hasher.service';
import { Tenant } from '../../domain/entities/tenant.entity';
import { User } from '../../domain/entities/user.entity';
import { TenantAlreadyExistsException } from '../../domain/exceptions/tenant-already-exists.exception';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';

export class RegisterTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterTenantInput): Promise<RegisterTenantOutput> {
    const email = input.email.toLowerCase().trim();

    const existingTenant = await this.tenantRepository.findByEmail(email);
    if (existingTenant) {
      throw new TenantAlreadyExistsException(email);
    }

    if (await this.userRepository.existsByEmail(email)) {
      throw new EmailAlreadyInUseException(email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const tenant = Tenant.create({
      name: input.tenantName,
      email,
      phone: input.phone,
      businessName: input.businessName,
      plan: 'FREE',
    });
    await this.tenantRepository.save(tenant);

    const adminUser = User.create({
      tenantId: tenant.id,
      name: input.tenantAdminName,
      email,
      passwordHash,
      role: 'TENANT_ADMIN',
    });
    await this.userRepository.save(adminUser);

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
      },
      user: {
        id: adminUser.id,
        tenantId: adminUser.tenantId,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    };
  }
}
