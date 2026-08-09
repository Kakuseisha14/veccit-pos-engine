import { CurrencyConverterService } from '../../infrastructure/currency/currency-converter.service';
import { Money } from '../../domain/value-objects/money';
import { InvalidExchangeRateException } from '../../domain/exceptions/invalid-exchange-rate.exception';

describe('CurrencyConverterService', () => {
  let service: CurrencyConverterService;

  beforeEach(() => {
    service = new CurrencyConverterService();
  });

  it('convierte USD a VES usando unidades menores exactas', () => {
    const usd = Money.fromMajor(10.5, 'USD');
    const ves = service.convertUsdToVes(usd, 60.5);

    expect(ves.currency).toBe('VES');
    expect(ves.amountMinorUnits).toBe(1050 * 60.5);
    expect(ves.toMajor()).toBeCloseTo(635.25, 2);
  });

  it('redondea correctamente fracciones de centavo', () => {
    const usd = Money.fromMajor(0.01, 'USD');
    const ves = service.convertUsdToVes(usd, 60.5);

    expect(ves.amountMinorUnits).toBe(Math.round(1 * 60.5));
  });

  it('mantiene precision en montos con decimales (no flotantes)', () => {
    const usd = Money.fromMajor(19.99, 'USD');
    const ves = service.convertUsdToVes(usd, 62.35);

    const expectedMinor = Math.round(1999 * 62.35);
    expect(ves.amountMinorUnits).toBe(expectedMinor);
    expect(Number.isInteger(ves.amountMinorUnits)).toBe(true);
  });

  it('lanza InvalidExchangeRateException con tasa cero', () => {
    const usd = Money.fromMajor(5, 'USD');
    expect(() => service.convertUsdToVes(usd, 0)).toThrow(
      InvalidExchangeRateException,
    );
  });

  it('lanza InvalidExchangeRateException con tasa negativa', () => {
    const usd = Money.fromMajor(5, 'USD');
    expect(() => service.convertUsdToVes(usd, -1)).toThrow(
      InvalidExchangeRateException,
    );
  });

  it('lanza InvalidExchangeRateException si la entrada no es USD', () => {
    const ves = Money.fromMajor(5, 'VES');
    expect(() => service.convertUsdToVes(ves, 60)).toThrow(
      InvalidExchangeRateException,
    );
  });
});
