import { Inject } from '@nestjs/common';
import type {
  AdjustStockInput,
  AdjustStockOutput,
} from '../dtos/adjust-stock.dto';
import { toProductOutput } from '../dtos/product-output.builder';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import type { IStockAdjustmentRepository } from '../../domain/repositories/stock-adjustment.repository';
import { STOCK_ADJUSTMENT_REPOSITORY } from '../../domain/repositories/stock-adjustment.repository';
import { StockAdjustment } from '../../domain/entities/stock-adjustment.entity';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';
import { InvalidStockAdjustmentException } from '../../domain/exceptions/invalid-stock-adjustment.exception';

export class AdjustStockUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(STOCK_ADJUSTMENT_REPOSITORY)
    private readonly stockAdjustmentRepository: IStockAdjustmentRepository,
  ) {}

  async execute(input: AdjustStockInput): Promise<AdjustStockOutput> {
    if (!Number.isInteger(input.quantity) || input.quantity === 0) {
      throw new InvalidStockAdjustmentException(
        'La cantidad debe ser un entero distinto de cero',
      );
    }
    const reason = input.reason.trim();
    if (reason.length === 0) {
      throw new InvalidStockAdjustmentException(
        'El motivo del ajuste es requerido',
      );
    }

    const product = await this.productRepository.findById(input.productId);
    if (!product || product.tenantId !== input.tenantId) {
      throw new ProductNotFoundException(input.productId);
    }

    const newStock = product.stock + input.quantity;
    if (newStock < 0) {
      throw new InsufficientStockException(
        product.id,
        product.stock,
        input.quantity,
      );
    }

    const updatedProduct = product.withStock(newStock);
    await this.productRepository.save(updatedProduct);

    const adjustment = StockAdjustment.create({
      tenantId: input.tenantId,
      productId: product.id,
      quantity: input.quantity,
      reason,
      performedById: input.performedById,
    });
    await this.stockAdjustmentRepository.save(adjustment);

    return {
      product: toProductOutput(updatedProduct, null),
      adjustment: {
        id: adjustment.id,
        productId: adjustment.productId,
        quantity: adjustment.quantity,
        reason: adjustment.reason,
        performedById: adjustment.performedById,
        createdAt: adjustment.createdAt,
      },
    };
  }
}
