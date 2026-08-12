import type { CashRegister } from '../../domain/entities/cash-register.entity';
import type { CashRegisterOutput } from './cash-register.dto';

export function toCashRegisterOutput(shift: CashRegister): CashRegisterOutput {
  return {
    id: shift.id,
    cashierId: shift.cashierId,
    openingAmountUSD: shift.openingAmountUSD,
    openedAt: shift.openedAt,
    status: shift.status,
    closedAt: shift.closedAt,
    closingAmountUSD: shift.closingAmountUSD,
    expectedCashUSD: shift.expectedCashUSD,
    differenceUSD: shift.differenceUSD,
    notes: shift.notes,
  };
}
