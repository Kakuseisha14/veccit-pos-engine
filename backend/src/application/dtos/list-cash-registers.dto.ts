import type { CashRegisterOutput } from './cash-register.dto';

export interface ListCashRegistersInput {
  tenantId: string;
}

export interface ListCashRegistersOutput {
  shifts: CashRegisterOutput[];
}
