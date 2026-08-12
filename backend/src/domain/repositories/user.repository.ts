import type { User } from '../entities/user.entity';
import type { Role } from '../value-objects/role';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTenantAndId(tenantId: string, id: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  listByTenant(tenantId: string): Promise<User[]>;
  listByRole(role: Role): Promise<User[]>;
  save(user: User): Promise<User>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
