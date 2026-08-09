import { Inject } from '@nestjs/common';
import type {
  GetActiveRateInput,
  GetActiveRateOutput,
} from '../dtos/get-active-rate.dto';
import type { IExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository';
import { EXCHANGE_RATE_REPOSITORY } from '../../domain/repositories/exchange-rate.repository';

export class GetActiveRateUseCase {
  constructor(
    @Inject(EXCHANGE_RATE_REPOSITORY)
    private readonly exchangeRateRepository: IExchangeRateRepository,
  ) {}

  async execute(input: GetActiveRateInput): Promise<GetActiveRateOutput> {
    const todayRate = await this.exchangeRateRepository.findByTenantAndDate(
      input.tenantId,
      input.date,
    );

    if (todayRate) {
      return {
        rate: {
          id: todayRate.id,
          rateVES: todayRate.rateVES,
          date: todayRate.date,
        },
      };
    }

    const latestRate = await this.exchangeRateRepository.findLatestByTenant(
      input.tenantId,
    );

    if (!latestRate) {
      return { rate: null };
    }

    return {
      rate: {
        id: latestRate.id,
        rateVES: latestRate.rateVES,
        date: latestRate.date,
      },
    };
  }
}
