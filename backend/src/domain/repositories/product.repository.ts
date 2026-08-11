import type { Product } from '../entities/product.entity';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByTenantAndId(tenantId: string, id: string): Promise<Product | null>;
  findBySku(tenantId: string, sku: string): Promise<Product | null>;
  listByTenant(tenantId: string): Promise<Product[]>;
  listLowStock(tenantId: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  decreaseStock(
    tenantId: string,
    productId: string,
    quantity: number,
  ): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
