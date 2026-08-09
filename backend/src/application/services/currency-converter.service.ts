import type { Money } from '../../domain/value-objects/money';

export interface ICurrencyConverter {
  convertUsdToVes(usdAmount: Money, rateVES: number): Money;
}

export const CURRENCY_CONVERTER = Symbol('ICurrencyConverter');
