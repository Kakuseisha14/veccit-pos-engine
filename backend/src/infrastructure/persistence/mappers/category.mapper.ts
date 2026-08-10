import { Category } from '../../../domain/entities/category.entity';
import { CategoryEntity } from '../entities/category.entity';

export function toDomainCategory(entity: CategoryEntity): Category {
  return new Category(
    entity.id,
    entity.tenantId,
    entity.name,
    entity.createdAt,
    entity.updatedAt,
    entity.isActive,
  );
}

export function toEntityCategory(category: Category): CategoryEntity {
  const entity = new CategoryEntity();
  entity.id = category.id;
  entity.tenantId = category.tenantId;
  entity.name = category.name;
  entity.isActive = category.isActive;
  entity.createdAt = category.createdAt;
  entity.updatedAt = category.updatedAt;
  return entity;
}
