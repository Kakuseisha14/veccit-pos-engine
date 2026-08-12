import { User } from '../../../domain/entities/user.entity';
import type { Role } from '../../../domain/value-objects/role';
import { UserEntity } from '../entities/user.entity';

export function toDomainUser(entity: UserEntity): User {
  return new User(
    entity.id,
    entity.tenantId,
    entity.name,
    entity.email,
    entity.passwordHash,
    entity.role as Role,
    entity.isActive,
    entity.avatarUrl,
    entity.createdAt,
    entity.updatedAt,
  );
}

export function toEntityUser(user: User): UserEntity {
  const entity = new UserEntity();
  entity.id = user.id;
  entity.tenantId = user.tenantId;
  entity.name = user.name;
  entity.email = user.email;
  entity.passwordHash = user.passwordHash;
  entity.role = user.role;
  entity.isActive = user.isActive;
  entity.avatarUrl = user.avatarUrl;
  entity.createdAt = user.createdAt;
  entity.updatedAt = user.updatedAt;
  return entity;
}
