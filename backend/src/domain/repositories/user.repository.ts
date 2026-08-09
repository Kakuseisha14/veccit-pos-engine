import type { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  existsByEmail(email: string): Promise<boolean>;
  listByTenant(tenantId: string): Promise<User[]>;
  save(user: User): Promise<User>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
