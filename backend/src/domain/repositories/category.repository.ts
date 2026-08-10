import type { Category } from '../entities/category.entity';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(tenantId: string, name: string): Promise<Category | null>;
  listByTenant(tenantId: string): Promise<Category[]>;
  save(category: Category): Promise<Category>;
}

export const CATEGORY_REPOSITORY = Symbol('ICategoryRepository');
