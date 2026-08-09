import { Inject } from '@nestjs/common';
import type {
  SetDailyRateInput,
  SetDailyRateOutput,
} from '../dtos/set-daily-rate.dto';
import type { IExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository';
import { EXCHANGE_RATE_REPOSITORY } from '../../domain/repositories/exchange-rate.repository';
import { ExchangeRate } from '../../domain/entities/exchange-rate.entity';
import { InvalidExchangeRateException } from '../../domain/exceptions/invalid-exchange-rate.exception';

export class SetDailyRateUseCase {
  constructor(
    @Inject(EXCHANGE_RATE_REPOSITORY)
    private readonly exchangeRateRepository: IExchangeRateRepository,
  ) {}

  async execute(input: SetDailyRateInput): Promise<SetDailyRateOutput> {
    if (!Number.isFinite(input.rateVES) || input.rateVES <= 0) {
      throw new InvalidExchangeRateException(input.rateVES);
    }

    const existing = await this.exchangeRateRepository.findByTenantAndDate(
      input.tenantId,
      input.date,
    );

    let rate: ExchangeRate;
    if (existing) {
      rate = new ExchangeRate(
        existing.id,
        existing.tenantId,
        input.rateVES,
        input.date,
        existing.createdAt,
        new Date(),
      );
    } else {
      rate = ExchangeRate.create({
        tenantId: input.tenantId,
        rateVES: input.rateVES,
        date: input.date,
      });
    }

    await this.exchangeRateRepository.save(rate);

    return {
      rate: {
        id: rate.id,
        rateVES: rate.rateVES,
        date: rate.date,
        createdAt: rate.createdAt,
        updatedAt: rate.updatedAt,
      },
    };
  }
}
