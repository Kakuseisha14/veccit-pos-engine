import type { Role } from '../../domain/value-objects/role';
import type { SessionUser } from './register-tenant.dto';

export interface UpdateUserInput {
  tenantId: string;
  userId: string;
  name?: string;
  role?: Role;
}

export interface UpdateUserOutput {
  user: SessionUser;
}
