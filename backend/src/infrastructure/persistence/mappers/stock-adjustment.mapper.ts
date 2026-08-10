import { StockAdjustment } from '../../../domain/entities/stock-adjustment.entity';
import { StockAdjustmentEntity } from '../entities/stock-adjustment.entity';

export function toDomainStockAdjustment(
  entity: StockAdjustmentEntity,
): StockAdjustment {
  return new StockAdjustment(
    entity.id,
    entity.tenantId,
    entity.productId,
    entity.quantity,
    entity.reason,
    entity.performedById,
    entity.createdAt,
  );
}

export function toEntityStockAdjustment(
  adjustment: StockAdjustment,
): StockAdjustmentEntity {
  const entity = new StockAdjustmentEntity();
  entity.id = adjustment.id;
  entity.tenantId = adjustment.tenantId;
  entity.productId = adjustment.productId;
  entity.quantity = adjustment.quantity;
  entity.reason = adjustment.reason;
  entity.performedById = adjustment.performedById;
  entity.createdAt = adjustment.createdAt;
  return entity;
}
