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
    public readonly avatarUrl: string | null,
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
      null,
      now,
      now,
    );
  }

  withName(name: string): User {
    return this.copyWith({ name: name.trim() });
  }

  withRole(role: Role): User {
    return new User(
      this.id,
      this.tenantId,
      this.name,
      this.email,
      this.passwordHash,
      role,
      this.isActive,
      this.avatarUrl,
      this.createdAt,
      new Date(),
    );
  }

  withAvatar(avatarUrl: string | null): User {
    return this.copyWith({ avatarUrl });
  }

  withPasswordHash(passwordHash: string): User {
    return new User(
      this.id,
      this.tenantId,
      this.name,
      this.email,
      passwordHash,
      this.role,
      this.isActive,
      this.avatarUrl,
      this.createdAt,
      new Date(),
    );
  }

  activate(): User {
    return this.copyWith({ isActive: true });
  }

  deactivate(): User {
    return this.copyWith({ isActive: false });
  }

  private copyWith({
    name,
    isActive,
    avatarUrl,
  }: {
    name?: string;
    isActive?: boolean;
    avatarUrl?: string | null;
  }): User {
    return new User(
      this.id,
      this.tenantId,
      name ?? this.name,
      this.email,
      this.passwordHash,
      this.role,
      isActive ?? this.isActive,
      avatarUrl === undefined ? this.avatarUrl : avatarUrl,
      this.createdAt,
      new Date(),
    );
  }
}
