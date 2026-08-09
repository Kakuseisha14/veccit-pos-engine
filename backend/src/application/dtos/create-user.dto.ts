import type { Role } from '../../domain/value-objects/role';
import type { SessionUser } from './register-tenant.dto';

export interface CreateUserInput {
  tenantId: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface CreateUserOutput {
  user: SessionUser;
}
