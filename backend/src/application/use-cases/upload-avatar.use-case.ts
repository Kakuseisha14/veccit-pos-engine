import { Inject } from '@nestjs/common';
import type {
  UploadAvatarInput,
  UploadAvatarOutput,
} from '../dtos/upload-avatar.dto';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IAvatarStorageService } from '../services/avatar-storage.service';
import { AVATAR_STORAGE } from '../services/avatar-storage.service';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidAvatarException } from '../../domain/exceptions/invalid-avatar.exception';

const ALLOWED_MIMETYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export class UploadAvatarUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AVATAR_STORAGE)
    private readonly avatarStorage: IAvatarStorageService,
  ) {}

  async execute(input: UploadAvatarInput): Promise<UploadAvatarOutput> {
    const extension = ALLOWED_MIMETYPES[input.mimetype];
    if (!extension) {
      throw new InvalidAvatarException(
        'solo se permiten imagenes PNG, JPG o WEBP',
      );
    }
    if (input.size <= 0) {
      throw new InvalidAvatarException('el archivo esta vacio');
    }
    if (input.size > MAX_SIZE_BYTES) {
      throw new InvalidAvatarException('el archivo supera el limite de 2MB');
    }

    const user = await this.userRepository.findByTenantAndId(
      input.tenantId,
      input.userId,
    );
    if (!user) {
      throw new UserNotFoundException();
    }

    const previousUrl = user.avatarUrl;
    const relativeUrl = await this.avatarStorage.save({
      tenantId: input.tenantId,
      userId: input.userId,
      extension,
      buffer: input.buffer,
    });

    if (previousUrl && previousUrl !== relativeUrl) {
      await this.avatarStorage.remove(previousUrl, input.tenantId);
    }

    const updated = user.withAvatar(relativeUrl);
    await this.userRepository.save(updated);

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
