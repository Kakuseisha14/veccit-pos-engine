import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import type { Category } from '../../domain/entities/category.entity';
import { CategoryEntity } from '../persistence/entities/category.entity';
import {
  toDomainCategory,
  toEntityCategory,
} from '../persistence/mappers/category.mapper';

@Injectable()
export class TypeOrmCategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {}

  async findById(id: string): Promise<Category | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? toDomainCategory(entity) : null;
  }

  async findByName(tenantId: string, name: string): Promise<Category | null> {
    const entity = await this.repository.findOneBy({ tenantId, name });
    return entity ? toDomainCategory(entity) : null;
  }

  async listByTenant(tenantId: string): Promise<Category[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
    return entities.map(toDomainCategory);
  }

  async save(category: Category): Promise<Category> {
    await this.repository.save(toEntityCategory(category));
    return category;
  }
}
