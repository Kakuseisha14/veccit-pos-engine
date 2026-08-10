import { Inject } from '@nestjs/common';
import type { ListCategoriesOutput } from '../dtos/category.dto';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository';

export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(tenantId: string): Promise<ListCategoriesOutput> {
    const categories = await this.categoryRepository.listByTenant(tenantId);
    return {
      categories: categories
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((category) => ({
          id: category.id,
          name: category.name,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })),
    };
  }
}
