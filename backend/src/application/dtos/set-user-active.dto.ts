import type { Role } from '../../domain/value-objects/role';

export interface SetUserActiveInput {
  tenantId: string;
  userId: string;
  actorId: string;
  isActive: boolean;
}

export interface SetUserActiveUser {
  id: string;
  tenantId: string | null;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  avatarUrl: string | null;
}

export interface SetUserActiveOutput {
  user: SetUserActiveUser;
}
