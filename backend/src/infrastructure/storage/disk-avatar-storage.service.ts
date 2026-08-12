import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import type {
  IAvatarStorageService,
  SaveAvatarInput,
} from '../../application/services/avatar-storage.service';

@Injectable()
export class DiskAvatarStorageService implements IAvatarStorageService {
  private readonly uploadsDir: string;

  constructor(config: ConfigService) {
    this.uploadsDir = join(
      process.cwd(),
      config.get<string>('UPLOADS_DIR', 'uploads'),
    );
  }

  async save(input: SaveAvatarInput): Promise<string> {
    const dir = join(this.uploadsDir, 'avatars', input.tenantId);
    await mkdir(dir, { recursive: true });
    const filename = `${input.userId}.${input.extension}`;
    await writeFile(join(dir, filename), input.buffer);
    return `/uploads/avatars/${input.tenantId}/${filename}`;
  }

  async remove(relativeUrl: string, tenantId: string): Promise<void> {
    const path = await this.resolveAbsolutePath(relativeUrl, tenantId);
    if (path) {
      await rm(path, { force: true });
    }
  }

  async resolveAbsolutePath(
    relativeUrl: string,
    tenantId: string,
  ): Promise<string | null> {
    const prefix = `/uploads/avatars/${tenantId}/`;
    if (!relativeUrl.startsWith(prefix)) {
      return null;
    }

    const filename = relativeUrl.slice(prefix.length);
    if (
      !filename ||
      filename.includes('\\') ||
      filename.includes('/') ||
      filename.includes('..')
    ) {
      return null;
    }

    const tenantRoot = normalize(join(this.uploadsDir, 'avatars', tenantId));
    const candidate = normalize(join(tenantRoot, filename));
    return candidate.startsWith(tenantRoot) ? candidate : null;
  }
}
