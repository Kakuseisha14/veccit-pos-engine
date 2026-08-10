import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import type { Product } from '../../domain/entities/product.entity';
import { ProductEntity } from '../persistence/entities/product.entity';
import {
  toDomainProduct,
  toEntityProduct,
} from '../persistence/mappers/product.mapper';

@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? toDomainProduct(entity) : null;
  }

  async findBySku(tenantId: string, sku: string): Promise<Product | null> {
    const entity = await this.repository.findOneBy({ tenantId, sku });
    return entity ? toDomainProduct(entity) : null;
  }

  async listByTenant(tenantId: string): Promise<Product[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
    return entities.map(toDomainProduct);
  }

  async listLowStock(tenantId: string): Promise<Product[]> {
    const entities = await this.repository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.stock <= product.minStock')
      .orderBy('product.stock', 'ASC')
      .getMany();
    return entities.map(toDomainProduct);
  }

  async save(product: Product): Promise<Product> {
    await this.repository.save(toEntityProduct(product));
    return product;
  }
}
