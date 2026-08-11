import { SalePayment } from '../../../domain/entities/sale-payment.entity';
import { SalePaymentEntity } from '../entities/sale-payment.entity';

export function toDomainSalePayment(entity: SalePaymentEntity): SalePayment {
  return new SalePayment(
    entity.id,
    entity.saleId,
    entity.paymentMethod,
    parseFloat(entity.amount),
    entity.currency,
    parseFloat(entity.exchangeRateVES),
    parseFloat(entity.amountUSD),
    entity.reference,
  );
}

export function toEntitySalePayment(payment: SalePayment): SalePaymentEntity {
  const entity = new SalePaymentEntity();
  entity.id = payment.id;
  entity.saleId = payment.saleId;
  entity.paymentMethod = payment.paymentMethod;
  entity.amount = payment.amount.toFixed(2);
  entity.currency = payment.currency;
  entity.exchangeRateVES = payment.exchangeRateVES.toFixed(4);
  entity.amountUSD = payment.amountUSD.toFixed(2);
  entity.reference = payment.reference;
  return entity;
}
