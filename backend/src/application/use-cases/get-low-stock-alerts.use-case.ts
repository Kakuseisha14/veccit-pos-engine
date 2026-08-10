import { Inject } from '@nestjs/common';
import type { LowStockAlertsOutput } from '../dtos/low-stock-alerts.dto';
import { toProductOutput } from '../dtos/product-output.builder';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository';

export class GetLowStockAlertsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(tenantId: string): Promise<LowStockAlertsOutput> {
    const products = await this.productRepository.listLowStock(tenantId);
    const categories = await this.categoryRepository.listByTenant(tenantId);
    const categoryById = new Map(
      categories.map((category) => [category.id, category]),
    );

    return {
      count: products.length,
      products: products
        .sort((a, b) => a.stock - b.stock)
        .map((product) =>
          toProductOutput(
            product,
            categoryById.get(product.categoryId ?? '') ?? null,
          ),
        ),
    };
  }
}
