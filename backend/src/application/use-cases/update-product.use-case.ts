import { Inject } from '@nestjs/common';
import type {
  UpdateProductInput,
  UpdateProductOutput,
} from '../dtos/update-product.dto';
import { toProductOutput } from '../dtos/product-output.builder';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository';
import { Product } from '../../domain/entities/product.entity';
import { Sku } from '../../domain/value-objects/sku';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { SkuAlreadyExistsException } from '../../domain/exceptions/sku-already-exists.exception';
import { CategoryNotFoundException } from '../../domain/exceptions/category-not-found.exception';
import { InvalidProductDataException } from '../../domain/exceptions/invalid-product-data.exception';

export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: UpdateProductInput): Promise<UpdateProductOutput> {
    const existing = await this.productRepository.findById(input.productId);
    if (!existing || existing.tenantId !== input.tenantId) {
      throw new ProductNotFoundException(input.productId);
    }

    const nextSku =
      input.sku !== undefined ? Sku.from(input.sku).value : existing.sku;
    if (nextSku !== existing.sku) {
      const bySku = await this.productRepository.findBySku(
        input.tenantId,
        nextSku,
      );
      if (bySku && bySku.id !== existing.id) {
        throw new SkuAlreadyExistsException(nextSku);
      }
    }

    const nextName =
      input.name !== undefined ? input.name.trim() : existing.name;
    if (nextName.length === 0) {
      throw new InvalidProductDataException(
        'El nombre del producto es requerido',
      );
    }
    if (
      input.priceUSD !== undefined &&
      (!Number.isFinite(input.priceUSD) || input.priceUSD < 0)
    ) {
      throw new InvalidProductDataException('El precio en USD es invalido');
    }
    if (
      input.costUSD !== undefined &&
      (!Number.isFinite(input.costUSD) || input.costUSD < 0)
    ) {
      throw new InvalidProductDataException('El costo en USD es invalido');
    }
    if (
      input.minStock !== undefined &&
      (!Number.isInteger(input.minStock) || input.minStock < 0)
    ) {
      throw new InvalidProductDataException('El stock minimo es invalido');
    }

    let nextCategoryId = existing.categoryId;
    let nextCategory = null;
    if (input.categoryId !== undefined) {
      nextCategoryId = input.categoryId;
      if (nextCategoryId) {
        nextCategory = await this.categoryRepository.findById(nextCategoryId);
        if (!nextCategory || nextCategory.tenantId !== input.tenantId) {
          throw new CategoryNotFoundException(nextCategoryId);
        }
      }
    }

    const updated = new Product(
      existing.id,
      existing.tenantId,
      nextSku,
      nextName,
      input.description !== undefined
        ? input.description?.trim() || null
        : existing.description,
      input.priceUSD ?? existing.priceUSD,
      input.costUSD ?? existing.costUSD,
      existing.stock,
      input.minStock ?? existing.minStock,
      nextCategoryId,
      input.isActive ?? existing.isActive,
      existing.createdAt,
      new Date(),
    );

    await this.productRepository.save(updated);

    return { product: toProductOutput(updated, nextCategory) };
  }
}
