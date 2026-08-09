import { randomUUID } from 'node:crypto';
import type { Role } from '../value-objects/role';

export interface CreateUserInput {
  tenantId: string | null;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly tenantId: string | null,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: CreateUserInput): User {
    const now = new Date();
    return new User(
      randomUUID(),
      input.tenantId,
      input.name.trim(),
      input.email.toLowerCase().trim(),
      input.passwordHash,
      input.role,
      true,
      now,
      now,
    );
  }
}
