import { Inject } from '@nestjs/common';
import type {
  CreateProductInput,
  CreateProductOutput,
} from '../dtos/create-product.dto';
import { toProductOutput } from '../dtos/product-output.builder';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository';
import { Product } from '../../domain/entities/product.entity';
import { Sku } from '../../domain/value-objects/sku';
import { SkuAlreadyExistsException } from '../../domain/exceptions/sku-already-exists.exception';
import { CategoryNotFoundException } from '../../domain/exceptions/category-not-found.exception';
import { InvalidProductDataException } from '../../domain/exceptions/invalid-product-data.exception';

export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
    const sku = Sku.from(input.sku);
    const name = input.name.trim();
    if (name.length === 0) {
      throw new InvalidProductDataException(
        'El nombre del producto es requerido',
      );
    }
    if (!Number.isFinite(input.priceUSD) || input.priceUSD < 0) {
      throw new InvalidProductDataException('El precio en USD es invalido');
    }
    if (
      input.costUSD !== undefined &&
      (!Number.isFinite(input.costUSD) || input.costUSD < 0)
    ) {
      throw new InvalidProductDataException('El costo en USD es invalido');
    }
    if (
      (input.stock !== undefined &&
        (!Number.isInteger(input.stock) || input.stock < 0)) ||
      (input.minStock !== undefined &&
        (!Number.isInteger(input.minStock) || input.minStock < 0))
    ) {
      throw new InvalidProductDataException('El stock es invalido');
    }

    const existing = await this.productRepository.findBySku(
      input.tenantId,
      sku.value,
    );
    if (existing) {
      throw new SkuAlreadyExistsException(sku.value);
    }

    let category = null;
    if (input.categoryId) {
      category = await this.categoryRepository.findById(input.categoryId);
      if (!category || category.tenantId !== input.tenantId) {
        throw new CategoryNotFoundException(input.categoryId);
      }
    }

    const product = Product.create({
      tenantId: input.tenantId,
      sku: sku.value,
      name,
      description: input.description ?? null,
      priceUSD: input.priceUSD,
      costUSD: input.costUSD ?? 0,
      stock: input.stock ?? 0,
      minStock: input.minStock ?? 0,
      categoryId: input.categoryId ?? null,
    });

    await this.productRepository.save(product);

    return { product: toProductOutput(product, category) };
  }
}
