import { SaleItem } from '../../../domain/entities/sale-item.entity';
import { SaleItemEntity } from '../entities/sale-item.entity';

export function toDomainSaleItem(entity: SaleItemEntity): SaleItem {
  return new SaleItem(
    entity.id,
    entity.saleId,
    entity.productId,
    entity.productName,
    entity.productSku,
    entity.quantity,
    parseFloat(entity.unitPriceUSD),
    parseFloat(entity.subtotalUSD),
  );
}

export function toEntitySaleItem(item: SaleItem): SaleItemEntity {
  const entity = new SaleItemEntity();
  entity.id = item.id;
  entity.saleId = item.saleId;
  entity.productId = item.productId;
  entity.productName = item.productName;
  entity.productSku = item.productSku;
  entity.quantity = item.quantity;
  entity.unitPriceUSD = item.unitPriceUSD.toFixed(2);
  entity.subtotalUSD = item.subtotalUSD.toFixed(2);
  return entity;
}
