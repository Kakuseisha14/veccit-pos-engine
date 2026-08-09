import { ExchangeRate } from '../../../domain/entities/exchange-rate.entity';
import { ExchangeRateEntity } from '../entities/exchange-rate.entity';

export function toDomainExchangeRate(entity: ExchangeRateEntity): ExchangeRate {
  return new ExchangeRate(
    entity.id,
    entity.tenantId,
    parseFloat(entity.rateVES),
    entity.date,
    entity.createdAt,
    entity.updatedAt,
  );
}

export function toEntityExchangeRate(rate: ExchangeRate): ExchangeRateEntity {
  const entity = new ExchangeRateEntity();
  entity.id = rate.id;
  entity.tenantId = rate.tenantId;
  entity.rateVES = rate.rateVES.toFixed(2);
  entity.date = rate.date;
  entity.createdAt = rate.createdAt;
  entity.updatedAt = rate.updatedAt;
  return entity;
}
