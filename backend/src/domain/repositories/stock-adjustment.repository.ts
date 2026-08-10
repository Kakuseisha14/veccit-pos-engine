import type { StockAdjustment } from '../entities/stock-adjustment.entity';

export interface IStockAdjustmentRepository {
  listByTenant(tenantId: string): Promise<StockAdjustment[]>;
  save(adjustment: StockAdjustment): Promise<StockAdjustment>;
}

export const STOCK_ADJUSTMENT_REPOSITORY = Symbol('IStockAdjustmentRepository');
