import { SalePayment } from './sale-payment.entity';

describe('SalePayment', () => {
  it('convierte un pago en VES a su equivalente exacto en USD', () => {
    const payment = SalePayment.create('sale-1', {
      paymentMethod: 'PAGO_MOVIL_VES',
      amount: 63000,
      currency: 'VES',
      exchangeRateVES: 60.5,
    });

    expect(payment.currency).toBe('VES');
    expect(payment.amountUSD).toBeCloseTo(1041.32, 2);
    expect(payment.amountUSD).toBe(Number((63000 / 60.5).toFixed(2)));
  });

  it('mantiene el monto sin convertir cuando el pago es en USD', () => {
    const payment = SalePayment.create('sale-1', {
      paymentMethod: 'CASH_USD',
      amount: 10.5,
      currency: 'USD',
      exchangeRateVES: 60.5,
    });

    expect(payment.amountUSD).toBe(10.5);
    expect(payment.amount).toBe(10.5);
  });

  it('lanza error si la tasa de cambio es cero o negativa en pagos VES', () => {
    expect(() =>
      SalePayment.create('sale-1', {
        paymentMethod: 'CASH_VES',
        amount: 100,
        currency: 'VES',
        exchangeRateVES: 0,
      }),
    ).toThrow('La tasa de cambio debe ser un número positivo mayor que 0');

    expect(() =>
      SalePayment.create('sale-1', {
        paymentMethod: 'CASH_VES',
        amount: 100,
        currency: 'VES',
        exchangeRateVES: -1,
      }),
    ).toThrow('La tasa de cambio debe ser un número positivo mayor que 0');
  });

  it('no pierde precision con decimales repetitivos en la conversion', () => {
    const payment = SalePayment.create('sale-1', {
      paymentMethod: 'CASH_VES',
      amount: 99.99,
      currency: 'VES',
      exchangeRateVES: 63.4,
    });

    const expected = Number((99.99 / 63.4).toFixed(2));
    expect(payment.amountUSD).toBe(expected);
    expect(payment.amountUSD).toBeCloseTo(1.58, 2);
  });
});
