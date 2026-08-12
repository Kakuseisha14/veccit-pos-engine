import { ShiftSummaryService } from './shift-summary.service';
import { Sale } from '../../domain/entities/sale.entity';

describe('ShiftSummaryService', () => {
  const service = new ShiftSummaryService();

  function createSale(
    status: 'COMPLETED' | 'VOIDED',
    payments: {
      paymentMethod: string;
      amountUSD: number;
    }[],
    totalUSD: number,
  ): Sale {
    const sale = Sale.create({
      tenantId: 'tenant-1',
      saleNumber: `V-${status}`,
      customerId: null,
      userId: 'user-1',
      exchangeRateVES: 60,
      items: [
        {
          productId: 'p1',
          productName: 'Coca-Cola 1.5L',
          productSku: 'BEB-001',
          quantity: 1,
          unitPriceUSD: totalUSD,
        },
      ],
      payments: payments.map((p) => ({
        paymentMethod: p.paymentMethod as never,
        amount: p.amountUSD,
        currency: 'USD' as const,
        exchangeRateVES: 60,
      })),
    });
    if (status === 'VOIDED') {
      return sale.void({ voidedByUserId: 'admin-1', reason: 'prueba' });
    }
    return sale;
  }

  it('agrega ventas completadas y calcula el efectivo esperado solo con metodos en efectivo', () => {
    const sales = [
      createSale(
        'COMPLETED',
        [
          { paymentMethod: 'CASH_USD', amountUSD: 5 },
          { paymentMethod: 'PAGO_MOVIL_VES', amountUSD: 5 },
        ],
        10,
      ),
    ];

    const totals = service.build(sales);

    expect(totals.salesCount).toBe(1);
    expect(totals.voidedSalesCount).toBe(0);
    expect(totals.totalSalesUSD).toBe(10);
    expect(totals.expectedCashUSD).toBe(5);
    expect(totals.payments).toHaveLength(2);
    const cash = totals.payments.find((p) => p.paymentMethod === 'CASH_USD');
    expect(cash?.totalUSD).toBe(5);
  });

  it('excluye ventas anuladas del total y del efectivo esperado', () => {
    const sales = [
      createSale('COMPLETED', [{ paymentMethod: 'CASH_USD', amountUSD: 5 }], 5),
      createSale('VOIDED', [{ paymentMethod: 'CASH_USD', amountUSD: 10 }], 10),
    ];

    const totals = service.build(sales);

    expect(totals.salesCount).toBe(1);
    expect(totals.voidedSalesCount).toBe(1);
    expect(totals.totalSalesUSD).toBe(5);
    expect(totals.totalVoidedUSD).toBe(10);
    expect(totals.expectedCashUSD).toBe(5);
  });

  it('agrupa pagos por metodo y los ordena por monto descendente', () => {
    const sales = [
      createSale(
        'COMPLETED',
        [
          { paymentMethod: 'CASH_USD', amountUSD: 2 },
          { paymentMethod: 'CASH_VES', amountUSD: 8 },
          { paymentMethod: 'CARD_VES', amountUSD: 4 },
        ],
        14,
      ),
    ];

    const totals = service.build(sales);

    expect(totals.payments.map((p) => p.paymentMethod)).toEqual([
      'CASH_VES',
      'CARD_VES',
      'CASH_USD',
    ]);
    expect(totals.expectedCashUSD).toBe(10);
  });
});
