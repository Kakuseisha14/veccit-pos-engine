import type { CashRegisterOutput } from './cash-register.dto';

export interface CloseCashRegisterInput {
  tenantId: string;
  shiftId: string;
  closingAmountUSD: number;
  notes?: string | null;
}

export interface CloseCashRegisterOutput {
  shift: CashRegisterOutput;
}
