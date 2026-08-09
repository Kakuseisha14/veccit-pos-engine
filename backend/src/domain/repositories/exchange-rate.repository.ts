import type { ExchangeRate } from '../entities/exchange-rate.entity';

export interface IExchangeRateRepository {
  findById(id: string): Promise<ExchangeRate | null>;
  findByTenantAndDate(
    tenantId: string,
    date: string,
  ): Promise<ExchangeRate | null>;
  findLatestByTenant(tenantId: string): Promise<ExchangeRate | null>;
  save(rate: ExchangeRate): Promise<ExchangeRate>;
}

export const EXCHANGE_RATE_REPOSITORY = Symbol('IExchangeRateRepository');
