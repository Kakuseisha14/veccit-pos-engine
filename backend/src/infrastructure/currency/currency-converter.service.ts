import { Injectable } from '@nestjs/common';
import type { ICurrencyConverter } from '../../application/services/currency-converter.service';
import { InvalidExchangeRateException } from '../../domain/exceptions/invalid-exchange-rate.exception';
import { Money } from '../../domain/value-objects/money';

@Injectable()
export class CurrencyConverterService implements ICurrencyConverter {
  convertUsdToVes(usdAmount: Money, rateVES: number): Money {
    if (usdAmount.currency !== 'USD') {
      throw new InvalidExchangeRateException(rateVES);
    }
    if (!Number.isFinite(rateVES) || rateVES <= 0) {
      throw new InvalidExchangeRateException(rateVES);
    }

    const vesMinorUnits = Math.round(usdAmount.amountMinorUnits * rateVES);
    return Money.fromMinorUnits(vesMinorUnits, 'VES');
  }
}
