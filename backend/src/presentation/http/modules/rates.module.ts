import { Module } from '@nestjs/common';
import { SetDailyRateUseCase } from '../../../application/use-cases/set-daily-rate.use-case';
import { GetActiveRateUseCase } from '../../../application/use-cases/get-active-rate.use-case';
import { RatesController } from '../controllers/rates.controller';
import { CURRENCY_CONVERTER } from '../../../application/services/currency-converter.service';
import { CurrencyConverterService } from '../../../infrastructure/currency/currency-converter.service';

@Module({
  controllers: [RatesController],
  providers: [
    SetDailyRateUseCase,
    GetActiveRateUseCase,
    { provide: CURRENCY_CONVERTER, useClass: CurrencyConverterService },
  ],
  exports: [CURRENCY_CONVERTER],
})
export class RatesModule {}
