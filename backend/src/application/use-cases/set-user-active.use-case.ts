import { Inject } from '@nestjs/common';
import type {
  SetUserActiveInput,
  SetUserActiveOutput,
} from '../dtos/set-user-active.dto';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { CannotDeactivateSelfException } from '../../domain/exceptions/cannot-deactivate-self.exception';

export class SetUserActiveUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: SetUserActiveInput): Promise<SetUserActiveOutput> {
    if (!input.isActive && input.userId === input.actorId) {
      throw new CannotDeactivateSelfException();
    }

    const user = await this.userRepository.findByTenantAndId(
      input.tenantId,
      input.userId,
    );
    if (!user) {
      throw new UserNotFoundException();
    }

    const updated = input.isActive ? user.activate() : user.deactivate();
    if (updated.isActive === user.isActive) {
      return this.output(user);
    }

    await this.userRepository.save(updated);
    return this.output(updated);
  }

  private output(user: User): SetUserActiveOutput {
    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
