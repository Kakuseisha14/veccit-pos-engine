import { Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IPasswordHasher } from '../services/password-hasher.service';
import { PASSWORD_HASHER } from '../services/password-hasher.service';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordOutput {
  user: {
    id: string;
    email: string;
  };
}

export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: ChangePasswordInput): Promise<ChangePasswordOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const isValid = await this.passwordHasher.compare(
      input.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new InvalidCredentialsException(
        'La contrasena actual es incorrecta',
      );
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    const updated = user.withPasswordHash(passwordHash);
    await this.userRepository.save(updated);

    return { user: { id: updated.id, email: updated.email } };
  }
}
