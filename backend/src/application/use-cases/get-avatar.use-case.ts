import { Inject } from '@nestjs/common';
import { createReadStream, type ReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { IAvatarStorageService } from '../services/avatar-storage.service';
import { AVATAR_STORAGE } from '../services/avatar-storage.service';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { AvatarNotFoundException } from '../../domain/exceptions/avatar-not-found.exception';

export interface GetAvatarInput {
  tenantId: string;
  userId: string;
}

export interface GetAvatarOutput {
  stream: ReadStream;
  contentType: string;
}

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

export class GetAvatarUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AVATAR_STORAGE)
    private readonly avatarStorage: IAvatarStorageService,
  ) {}

  async execute(input: GetAvatarInput): Promise<GetAvatarOutput> {
    const user = await this.userRepository.findByTenantAndId(
      input.tenantId,
      input.userId,
    );
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!user.avatarUrl) {
      throw new AvatarNotFoundException();
    }

    const absolutePath = await this.avatarStorage.resolveAbsolutePath(
      user.avatarUrl,
      input.tenantId,
    );
    if (!absolutePath) {
      throw new AvatarNotFoundException();
    }

    const extension = user.avatarUrl.split('.').pop()?.toLowerCase() ?? '';
    const contentType = CONTENT_TYPES[extension] ?? 'application/octet-stream';

    try {
      await stat(absolutePath);
    } catch {
      throw new AvatarNotFoundException();
    }

    return { stream: createReadStream(absolutePath), contentType };
  }
}
