import { Inject } from '@nestjs/common';
import type {
  ListProductsInput,
  ListProductsOutput,
} from '../dtos/list-products.dto';
import { toProductOutput } from '../dtos/product-output.builder';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository';

export class ListProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: ListProductsInput): Promise<ListProductsOutput> {
    const products = await this.productRepository.listByTenant(input.tenantId);
    const categories = await this.categoryRepository.listByTenant(
      input.tenantId,
    );
    const categoryById = new Map(
      categories.map((category) => [category.id, category]),
    );

    return {
      products: products
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((product) =>
          toProductOutput(
            product,
            categoryById.get(product.categoryId ?? '') ?? null,
            input.includeCost,
          ),
        ),
    };
  }
}
