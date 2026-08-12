import { Inject } from '@nestjs/common';
import type {
  UpdateUserInput,
  UpdateUserOutput,
} from '../dtos/update-user.dto';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidRoleException } from '../../domain/exceptions/invalid-role.exception';

export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateUserInput): Promise<UpdateUserOutput> {
    const user = await this.userRepository.findByTenantAndId(
      input.tenantId,
      input.userId,
    );
    if (!user) {
      throw new UserNotFoundException();
    }

    let updated = user;
    if (input.role !== undefined) {
      if (input.role === 'SUPER_ADMIN') {
        throw new InvalidRoleException(input.role);
      }
      updated = updated.withRole(input.role);
    }
    if (input.name !== undefined) {
      updated = updated.withName(input.name);
    }

    if (updated !== user) {
      await this.userRepository.save(updated);
    }

    return {
      user: {
        id: updated.id,
        tenantId: updated.tenantId,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
      },
    };
  }
}
