import type { ProductOutput } from './product.dto';

export interface AdjustStockInput {
  tenantId: string;
  productId: string;
  quantity: number;
  reason: string;
  performedById: string;
}

export interface StockAdjustmentOutput {
  id: string;
  productId: string;
  quantity: number;
  reason: string;
  performedById: string;
  createdAt: Date;
}

export interface AdjustStockOutput {
  product: ProductOutput;
  adjustment: StockAdjustmentOutput;
}
