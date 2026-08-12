export interface SaveAvatarInput {
  tenantId: string;
  userId: string;
  extension: string;
  buffer: Buffer;
}

export interface IAvatarStorageService {
  save(input: SaveAvatarInput): Promise<string>;
  remove(relativeUrl: string, tenantId: string): Promise<void>;
  resolveAbsolutePath(
    avatarUrl: string,
    tenantId: string,
  ): Promise<string | null>;
}

export const AVATAR_STORAGE = Symbol('IAvatarStorageService');
