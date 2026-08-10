import { Inject } from '@nestjs/common';
import type {
  UpdateCategoryInput,
  UpdateCategoryOutput,
} from '../dtos/category.dto';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository';
import { CategoryNotFoundException } from '../../domain/exceptions/category-not-found.exception';
import { CategoryAlreadyExistsException } from '../../domain/exceptions/category-already-exists.exception';
import { InvalidCategoryNameException } from '../../domain/exceptions/invalid-category-name.exception';
import { InvalidCategoryDataException } from '../../domain/exceptions/invalid-category-data.exception';

export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    if (input.name === undefined && input.isActive === undefined) {
      throw new InvalidCategoryDataException(
        'Proporciona al menos un campo para actualizar la categoria',
      );
    }

    const category = await this.categoryRepository.findById(
      input.tenantId,
      input.categoryId,
    );
    if (!category) {
      throw new CategoryNotFoundException(input.categoryId);
    }

    let updated = category;

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (name.length === 0) {
        throw new InvalidCategoryNameException();
      }
      const existing = await this.categoryRepository.findByName(
        input.tenantId,
        name,
      );
      if (existing && existing.id !== category.id) {
        throw new CategoryAlreadyExistsException(name);
      }
      updated = updated.rename(name);
    }

    if (input.isActive !== undefined) {
      updated = updated.setActive(input.isActive);
    }

    await this.categoryRepository.save(updated);

    return {
      category: {
        id: updated.id,
        name: updated.name,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  }
}
