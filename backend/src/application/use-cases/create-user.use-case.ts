import { Inject } from '@nestjs/common';
import type {
  CreateUserInput,
  CreateUserOutput,
} from '../dtos/create-user.dto';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IPasswordHasher } from '../services/password-hasher.service';
import { PASSWORD_HASHER } from '../services/password-hasher.service';
import { User } from '../../domain/entities/user.entity';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';
import { InvalidRoleException } from '../../domain/exceptions/invalid-role.exception';
import type { Role } from '../../domain/value-objects/role';

export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    if (input.role === 'SUPER_ADMIN') {
      throw new InvalidRoleException(input.role);
    }

    const email = input.email.toLowerCase().trim();
    if (await this.userRepository.existsByEmail(email)) {
      throw new EmailAlreadyInUseException(email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = User.create({
      tenantId: input.tenantId,
      name: input.name,
      email,
      passwordHash,
      role: input.role as Role,
    });
    await this.userRepository.save(user);

    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
