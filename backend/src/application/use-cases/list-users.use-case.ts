import { Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';

export interface ListUsersOutput {
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    avatarUrl: string | null;
  }[];
}

export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(tenantId: string): Promise<ListUsersOutput> {
    const users = await this.userRepository.listByTenant(tenantId);

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        avatarUrl: user.avatarUrl,
      })),
    };
  }
}
