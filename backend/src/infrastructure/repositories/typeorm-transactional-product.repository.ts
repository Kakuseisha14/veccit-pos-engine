import { EntityManager } from 'typeorm';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import type { Product } from '../../domain/entities/product.entity';
import { ProductEntity } from '../persistence/entities/product.entity';
import {
  toDomainProduct,
  toEntityProduct,
} from '../persistence/mappers/product.mapper';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';

export class TypeOrmTransactionalProductRepository implements IProductRepository {
  constructor(private readonly manager: EntityManager) {}

  async findById(id: string): Promise<Product | null> {
    const entity = await this.manager.findOneBy(ProductEntity, { id });
    return entity ? toDomainProduct(entity) : null;
  }

  async findByTenantAndId(
    tenantId: string,
    id: string,
  ): Promise<Product | null> {
    const entity = await this.manager.findOneBy(ProductEntity, {
      tenantId,
      id,
    });
    return entity ? toDomainProduct(entity) : null;
  }

  async findBySku(tenantId: string, sku: string): Promise<Product | null> {
    const entity = await this.manager.findOneBy(ProductEntity, {
      tenantId,
      sku,
    });
    return entity ? toDomainProduct(entity) : null;
  }

  async listByTenant(tenantId: string): Promise<Product[]> {
    const entities = await this.manager.find(ProductEntity, {
      where: { tenantId },
      order: { name: 'ASC' },
    });
    return entities.map(toDomainProduct);
  }

  async listLowStock(tenantId: string): Promise<Product[]> {
    const entities = await this.manager
      .createQueryBuilder(ProductEntity, 'product')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.stock <= product.minStock')
      .orderBy('product.stock', 'ASC')
      .getMany();
    return entities.map(toDomainProduct);
  }

  async save(product: Product): Promise<Product> {
    await this.manager.save(toEntityProduct(product));
    return product;
  }

  async decreaseStock(
    tenantId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    const result = await this.manager.query(
      `UPDATE "products"
       SET "stock" = "stock" - $1, "updatedAt" = now()
       WHERE "id" = $2 AND "tenantId" = $3 AND "stock" >= $1
       RETURNING "id"`,
      [quantity, productId, tenantId],
    );
    if (result.length === 0) {
      const existing = await this.manager.findOneBy(ProductEntity, {
        tenantId,
        id: productId,
      });
      if (!existing) {
        throw new ProductNotFoundException(productId);
      }
      throw new InsufficientStockException(productId, existing.stock, quantity);
    }
  }
}
