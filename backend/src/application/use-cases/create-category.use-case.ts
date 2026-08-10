import { Inject } from '@nestjs/common';
import type {
  CreateCategoryInput,
  CreateCategoryOutput,
} from '../dtos/category.dto';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';
import { CategoryAlreadyExistsException } from '../../domain/exceptions/category-already-exists.exception';
import { InvalidCategoryNameException } from '../../domain/exceptions/invalid-category-name.exception';

export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const name = input.name.trim();
    if (name.length === 0) {
      throw new InvalidCategoryNameException();
    }

    const existing = await this.categoryRepository.findByName(
      input.tenantId,
      name,
    );
    if (existing) {
      throw new CategoryAlreadyExistsException(name);
    }

    const category = Category.create({ tenantId: input.tenantId, name });
    await this.categoryRepository.save(category);

    return {
      category: {
        id: category.id,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    };
  }
}
