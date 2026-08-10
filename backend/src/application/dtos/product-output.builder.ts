import type { Category } from '../../domain/entities/category.entity';
import type { Product } from '../../domain/entities/product.entity';
import type { ProductOutput } from './product.dto';

export function toProductOutput(
  product: Product,
  category: Category | null,
  includeCost = true,
): ProductOutput {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    priceUSD: product.priceUSD,
    costUSD: includeCost ? product.costUSD : 0,
    stock: product.stock,
    minStock: product.minStock,
    categoryId: product.categoryId,
    categoryName: category?.name ?? null,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
