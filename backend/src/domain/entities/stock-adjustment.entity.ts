import { randomUUID } from 'node:crypto';

export interface CreateStockAdjustmentInput {
  tenantId: string;
  productId: string;
  quantity: number;
  reason: string;
  performedById: string;
}

export class StockAdjustment {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly reason: string,
    public readonly performedById: string,
    public readonly createdAt: Date,
  ) {}

  static create(input: CreateStockAdjustmentInput): StockAdjustment {
    return new StockAdjustment(
      randomUUID(),
      input.tenantId,
      input.productId,
      input.quantity,
      input.reason.trim(),
      input.performedById,
      new Date(),
    );
  }
}
