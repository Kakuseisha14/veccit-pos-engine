import { Sale } from './sale.entity';
import { InvalidPaymentTotalException } from '../exceptions/invalid-payment-total.exception';

const baseInput = {
  tenantId: 'tenant-1',
  saleNumber: 'V-0001',
  customerId: null,
  userId: 'user-1',
  exchangeRateVES: 60,
  taxUSD: 0,
};

const twoColaItems = [
  {
    productId: 'p1',
    productName: 'Coca-Cola 1.5L',
    productSku: 'BEB-001',
    quantity: 2,
    unitPriceUSD: 2.5,
  },
];

describe('Sale', () => {
  it('calcula subtotal, total USD y total VES exactos', () => {
    const sale = Sale.create({
      ...baseInput,
      items: twoColaItems,
      payments: [
        {
          paymentMethod: 'CASH_USD',
          amount: 2,
          currency: 'USD',
          exchangeRateVES: 60,
        },
        {
          paymentMethod: 'PAGO_MOVIL_VES',
          amount: 180,
          currency: 'VES',
          exchangeRateVES: 60,
        },
      ],
    });

    expect(sale.subtotalUSD).toBe(5);
    expect(sale.totalUSD).toBe(5);
    expect(sale.totalVES).toBe(300);
    expect(sale.status).toBe('COMPLETED');
    expect(sale.items).toHaveLength(1);
    expect(sale.items[0].subtotalUSD).toBe(5);
  });

  it('incluye el impuesto en el total', () => {
    const sale = Sale.create({
      ...baseInput,
      items: twoColaItems,
      taxUSD: 0.5,
      payments: [
        {
          paymentMethod: 'CASH_USD',
          amount: 5.5,
          currency: 'USD',
          exchangeRateVES: 60,
        },
      ],
    });

    expect(sale.subtotalUSD).toBe(5);
    expect(sale.taxUSD).toBe(0.5);
    expect(sale.totalUSD).toBe(5.5);
  });

  it('acepta una diferencia de centavos por redondeo de conversion (tolerancia)', () => {
    const sale = Sale.create({
      ...baseInput,
      items: twoColaItems,
      payments: [
        {
          paymentMethod: 'CASH_VES',
          amount: 300.01,
          currency: 'VES',
          exchangeRateVES: 60,
        },
      ],
    });

    expect(sale.totalUSD).toBe(5);
    expect(sale.payments[0].amountUSD).toBe(5);
  });

  it('rechaza pagos que no cubren el total de la venta', () => {
    expect(() =>
      Sale.create({
        ...baseInput,
        items: twoColaItems,
        payments: [
          {
            paymentMethod: 'CASH_USD',
            amount: 4,
            currency: 'USD',
            exchangeRateVES: 60,
          },
        ],
      }),
    ).toThrow(InvalidPaymentTotalException);
  });

  it('rechaza pagos que exceden el total de la venta', () => {
    expect(() =>
      Sale.create({
        ...baseInput,
        items: twoColaItems,
        payments: [
          {
            paymentMethod: 'CASH_USD',
            amount: 6,
            currency: 'USD',
            exchangeRateVES: 60,
          },
        ],
      }),
    ).toThrow(InvalidPaymentTotalException);
  });

  it('rechaza una venta sin productos', () => {
    expect(() =>
      Sale.create({
        ...baseInput,
        items: [],
        payments: [
          {
            paymentMethod: 'CASH_USD',
            amount: 5,
            currency: 'USD',
            exchangeRateVES: 60,
          },
        ],
      }),
    ).toThrow('La venta debe contener al menos un producto');
  });

  it('rechaza una venta sin pagos', () => {
    expect(() =>
      Sale.create({
        ...baseInput,
        items: twoColaItems,
        payments: [],
      }),
    ).toThrow('La venta debe contener al menos un pago');
  });

  it('rechaza una tasa de cambio no positiva', () => {
    expect(() =>
      Sale.create({
        ...baseInput,
        exchangeRateVES: 0,
        items: twoColaItems,
        payments: [
          {
            paymentMethod: 'CASH_USD',
            amount: 5,
            currency: 'USD',
            exchangeRateVES: 60,
          },
        ],
      }),
    ).toThrow('La tasa de cambio debe ser mayor a 0');
  });

  it('calcula totales exactos con multiples items (sin error de precision flotante)', () => {
    const sale = Sale.create({
      ...baseInput,
      items: [
        {
          productId: 'p1',
          productName: 'A',
          productSku: 'A-1',
          quantity: 3,
          unitPriceUSD: 0.1,
        },
        {
          productId: 'p2',
          productName: 'B',
          productSku: 'B-1',
          quantity: 1,
          unitPriceUSD: 19.99,
        },
        {
          productId: 'p3',
          productName: 'C',
          productSku: 'C-1',
          quantity: 2,
          unitPriceUSD: 1.05,
        },
      ],
      payments: [
        {
          paymentMethod: 'CASH_USD',
          amount: 22.39,
          currency: 'USD',
          exchangeRateVES: 60,
        },
      ],
    });

    expect(sale.subtotalUSD).toBe(22.39);
    expect(sale.totalUSD).toBe(22.39);
  });
});
