import { Injectable } from '@nestjs/common';
import type { Sale } from '../../domain/entities/sale.entity';
import type { PaymentMethodSummary } from '../dtos/shift-summary.dto';

const CASH_METHODS: ReadonlySet<string> = new Set(['CASH_USD', 'CASH_VES']);

export interface ShiftTotals {
  salesCount: number;
  voidedSalesCount: number;
  totalSalesUSD: number;
  totalVoidedUSD: number;
  expectedCashUSD: number;
  payments: PaymentMethodSummary[];
}

@Injectable()
export class ShiftSummaryService {
  build(sales: Sale[]): ShiftTotals {
    const completed = sales.filter((sale) => sale.status === 'COMPLETED');
    const voided = sales.filter((sale) => sale.status === 'VOIDED');

    const totalSalesUSD = Number(
      completed.reduce((sum, sale) => sum + sale.totalUSD, 0).toFixed(2),
    );
    const totalVoidedUSD = Number(
      voided.reduce((sum, sale) => sum + sale.totalUSD, 0).toFixed(2),
    );

    const paymentMap = new Map<string, { totalUSD: number; count: number }>();
    let expectedCashUSD = 0;
    for (const sale of completed) {
      for (const payment of sale.payments) {
        const entry = paymentMap.get(payment.paymentMethod) ?? {
          totalUSD: 0,
          count: 0,
        };
        entry.totalUSD = Number(
          (entry.totalUSD + payment.amountUSD).toFixed(2),
        );
        entry.count += 1;
        paymentMap.set(payment.paymentMethod, entry);
        if (CASH_METHODS.has(payment.paymentMethod)) {
          expectedCashUSD = Number(
            (expectedCashUSD + payment.amountUSD).toFixed(2),
          );
        }
      }
    }

    const payments: PaymentMethodSummary[] = Array.from(paymentMap.entries())
      .map(([paymentMethod, value]) => ({
        paymentMethod,
        totalUSD: value.totalUSD,
        count: value.count,
      }))
      .sort((a, b) => b.totalUSD - a.totalUSD);

    return {
      salesCount: completed.length,
      voidedSalesCount: voided.length,
      totalSalesUSD,
      totalVoidedUSD,
      expectedCashUSD,
      payments,
    };
  }
}
