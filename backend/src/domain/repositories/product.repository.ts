import type { Product } from '../entities/product.entity';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(tenantId: string, sku: string): Promise<Product | null>;
  listByTenant(tenantId: string): Promise<Product[]>;
  listLowStock(tenantId: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
