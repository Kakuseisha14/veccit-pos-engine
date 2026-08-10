import { Product } from '../../../domain/entities/product.entity';
import { ProductEntity } from '../entities/product.entity';

export function toDomainProduct(entity: ProductEntity): Product {
  return new Product(
    entity.id,
    entity.tenantId,
    entity.sku,
    entity.name,
    entity.description,
    parseFloat(entity.priceUSD),
    parseFloat(entity.costUSD),
    entity.stock,
    entity.minStock,
    entity.categoryId,
    entity.isActive,
    entity.createdAt,
    entity.updatedAt,
  );
}

export function toEntityProduct(product: Product): ProductEntity {
  const entity = new ProductEntity();
  entity.id = product.id;
  entity.tenantId = product.tenantId;
  entity.sku = product.sku;
  entity.name = product.name;
  entity.description = product.description;
  entity.priceUSD = product.priceUSD.toFixed(2);
  entity.costUSD = product.costUSD.toFixed(2);
  entity.stock = product.stock;
  entity.minStock = product.minStock;
  entity.categoryId = product.categoryId;
  entity.isActive = product.isActive;
  entity.createdAt = product.createdAt;
  entity.updatedAt = product.updatedAt;
  return entity;
}
