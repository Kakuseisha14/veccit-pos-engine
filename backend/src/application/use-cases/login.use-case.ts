import { Inject } from '@nestjs/common';
import type { LoginInput, LoginOutput } from '../dtos/login.dto';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TENANT_REPOSITORY } from '../../domain/repositories/tenant.repository';
import type { IPasswordHasher } from '../services/password-hasher.service';
import { PASSWORD_HASHER } from '../services/password-hasher.service';
import type { ITokenService } from '../services/token.service';
import { TOKEN_SERVICE } from '../services/token.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: ITenantRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = input.email.toLowerCase().trim();

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new InvalidCredentialsException();
    }

    const passwordValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new InvalidCredentialsException();
    }

    let tenant: LoginOutput['tenant'] = null;
    if (user.tenantId) {
      const found = await this.tenantRepository.findById(user.tenantId);
      if (found) {
        tenant = { id: found.id, name: found.name, plan: found.plan };
      }
    }

    const accessToken = await this.tokenService.sign({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    return {
      accessToken,
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
