import type { ShiftStatus } from '../../domain/entities/cash-register.entity';

export interface CashRegisterOutput {
  id: string;
  cashierId: string;
  openingAmountUSD: number;
  openedAt: Date;
  status: ShiftStatus;
  closedAt: Date | null;
  closingAmountUSD: number | null;
  expectedCashUSD: number | null;
  differenceUSD: number | null;
  notes: string | null;
}
