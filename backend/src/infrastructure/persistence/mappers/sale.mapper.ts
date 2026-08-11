import { Sale } from '../../../domain/entities/sale.entity';
import { SaleItemEntity } from '../entities/sale-item.entity';
import { SalePaymentEntity } from '../entities/sale-payment.entity';
import { SaleEntity } from '../entities/sale.entity';
import { toDomainSaleItem, toEntitySaleItem } from './sale-item.mapper';
import {
  toDomainSalePayment,
  toEntitySalePayment,
} from './sale-payment.mapper';

export function toDomainSale(
  entity: SaleEntity,
  itemEntities: SaleItemEntity[] = [],
  paymentEntities: SalePaymentEntity[] = [],
): Sale {
  return new Sale(
    entity.id,
    entity.tenantId,
    entity.saleNumber,
    entity.customerId,
    entity.userId,
    itemEntities.map(toDomainSaleItem),
    paymentEntities.map(toDomainSalePayment),
    parseFloat(entity.subtotalUSD),
    parseFloat(entity.taxUSD),
    parseFloat(entity.totalUSD),
    parseFloat(entity.exchangeRateVES),
    parseFloat(entity.totalVES),
    entity.status,
    entity.createdAt,
  );
}

export function toEntitySale(sale: Sale): SaleEntity {
  const entity = new SaleEntity();
  entity.id = sale.id;
  entity.tenantId = sale.tenantId;
  entity.saleNumber = sale.saleNumber;
  entity.customerId = sale.customerId;
  entity.userId = sale.userId;
  entity.subtotalUSD = sale.subtotalUSD.toFixed(2);
  entity.taxUSD = sale.taxUSD.toFixed(2);
  entity.totalUSD = sale.totalUSD.toFixed(2);
  entity.exchangeRateVES = sale.exchangeRateVES.toFixed(4);
  entity.totalVES = sale.totalVES.toFixed(2);
  entity.status = sale.status;
  entity.createdAt = sale.createdAt;
  return entity;
}

export function toEntitySaleItems(sale: Sale): SaleItemEntity[] {
  return sale.items.map(toEntitySaleItem);
}

export function toEntitySalePayments(sale: Sale): SalePaymentEntity[] {
  return sale.payments.map(toEntitySalePayment);
}
