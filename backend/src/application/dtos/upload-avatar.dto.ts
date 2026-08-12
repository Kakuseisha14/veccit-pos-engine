import type { SessionUser } from './register-tenant.dto';

export interface UploadAvatarInput {
  tenantId: string;
  userId: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadAvatarOutput {
  user: SessionUser;
}
