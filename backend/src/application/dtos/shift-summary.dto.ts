import type { CashRegisterOutput } from './cash-register.dto';
import type { SaleOutput } from './sale.dto';

export interface PaymentMethodSummary {
  paymentMethod: string;
  totalUSD: number;
  count: number;
}

export interface ShiftSummaryOutput {
  shift: CashRegisterOutput;
  salesCount: number;
  voidedSalesCount: number;
  totalSalesUSD: number;
  totalVoidedUSD: number;
  expectedCashUSD: number;
  payments: PaymentMethodSummary[];
  sales: SaleOutput[];
}
