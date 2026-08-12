import type { CashRegisterOutput } from './cash-register.dto';

export interface OpenCashRegisterInput {
  tenantId: string;
  cashierId: string;
  openingAmountUSD: number;
}

export interface OpenCashRegisterOutput {
  shift: CashRegisterOutput;
}
