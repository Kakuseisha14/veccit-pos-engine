import { GetActiveRateUseCase } from './get-active-rate.use-case';
import type { IExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository';
import type { ExchangeRate } from '../../domain/entities/exchange-rate.entity';

describe('GetActiveRateUseCase', () => {
  let useCase: GetActiveRateUseCase;
  const exchangeRateRepository: jest.Mocked<IExchangeRateRepository> = {
    findById: jest.fn(),
    findByTenantAndDate: jest.fn(),
    findLatestByTenant: jest.fn(),
    save: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const today = '2026-08-09';

  const buildRate = (partial: Partial<ExchangeRate>): ExchangeRate => ({
    id: 'rate-1',
    tenantId,
    rateVES: 60.5,
    date: today,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetActiveRateUseCase(exchangeRateRepository);
  });

  it('devuelve la tasa de hoy si existe', async () => {
    exchangeRateRepository.findByTenantAndDate.mockResolvedValue(
      buildRate({ rateVES: 61 }),
    );

    const result = await useCase.execute({ tenantId, date: today });

    expect(result.rate?.rateVES).toBe(61);
    expect(exchangeRateRepository.findLatestByTenant).not.toHaveBeenCalled();
  });

  it('usa la tasa mas reciente si hoy no tiene', async () => {
    exchangeRateRepository.findByTenantAndDate.mockResolvedValue(null);
    exchangeRateRepository.findLatestByTenant.mockResolvedValue(
      buildRate({ id: 'rate-old', date: '2026-08-08', rateVES: 55 }),
    );

    const result = await useCase.execute({ tenantId, date: today });

    expect(result.rate?.id).toBe('rate-old');
    expect(result.rate?.date).toBe('2026-08-08');
  });

  it('devuelve rate null si no existe ninguna tasa', async () => {
    exchangeRateRepository.findByTenantAndDate.mockResolvedValue(null);
    exchangeRateRepository.findLatestByTenant.mockResolvedValue(null);

    const result = await useCase.execute({ tenantId, date: today });

    expect(result.rate).toBeNull();
  });
});
