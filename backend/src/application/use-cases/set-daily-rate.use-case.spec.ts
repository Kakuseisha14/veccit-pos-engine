import { SetDailyRateUseCase } from './set-daily-rate.use-case';
import type { IExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository';
import type { ExchangeRate } from '../../domain/entities/exchange-rate.entity';
import { InvalidExchangeRateException } from '../../domain/exceptions/invalid-exchange-rate.exception';

describe('SetDailyRateUseCase', () => {
  let useCase: SetDailyRateUseCase;
  const exchangeRateRepository: jest.Mocked<IExchangeRateRepository> = {
    findById: jest.fn(),
    findByTenantAndDate: jest.fn(),
    findLatestByTenant: jest.fn(),
    save: jest.fn(),
  };

  const tenantId = 'tenant-1';
  const date = '2026-08-09';

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SetDailyRateUseCase(exchangeRateRepository);
  });

  it('crea una nueva tasa del dia', async () => {
    exchangeRateRepository.findByTenantAndDate.mockResolvedValue(null);
    exchangeRateRepository.save.mockImplementation(async (r) => r);

    const result = await useCase.execute({ tenantId, rateVES: 60.5, date });

    expect(exchangeRateRepository.save).toHaveBeenCalledTimes(1);
    expect(result.rate.rateVES).toBe(60.5);
    expect(result.rate.date).toBe(date);
  });

  it('actualiza la tasa existente del dia conservando el id', async () => {
    const existing: ExchangeRate = {
      id: 'rate-1',
      tenantId,
      rateVES: 58,
      date,
      createdAt: new Date('2026-08-09T08:00:00Z'),
      updatedAt: new Date('2026-08-09T08:00:00Z'),
    };
    exchangeRateRepository.findByTenantAndDate.mockResolvedValue(existing);
    exchangeRateRepository.save.mockImplementation(async (r) => r);

    const result = await useCase.execute({ tenantId, rateVES: 61.25, date });

    expect(result.rate.id).toBe('rate-1');
    expect(result.rate.rateVES).toBe(61.25);
    expect(exchangeRateRepository.save).toHaveBeenCalledTimes(1);
  });

  it('lanza InvalidExchangeRateException si la tasa es <= 0', async () => {
    await expect(
      useCase.execute({ tenantId, rateVES: 0, date }),
    ).rejects.toThrow(InvalidExchangeRateException);
    expect(exchangeRateRepository.save).not.toHaveBeenCalled();
  });

  it('lanza InvalidExchangeRateException si la tasa no es finita', async () => {
    await expect(
      useCase.execute({ tenantId, rateVES: Number.NaN, date }),
    ).rejects.toThrow(InvalidExchangeRateException);
    expect(exchangeRateRepository.save).not.toHaveBeenCalled();
  });
});
