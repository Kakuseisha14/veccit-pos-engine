import { randomUUID } from 'node:crypto';
import { ShiftAlreadyClosedException } from '../exceptions/shift-already-closed.exception';

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface CreateCashRegisterInput {
  tenantId: string;
  cashierId: string;
  openingAmountUSD: number;
}

export class CashRegister {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly cashierId: string,
    public readonly openingAmountUSD: number,
    public readonly openedAt: Date,
    public readonly status: ShiftStatus,
    public readonly closedAt: Date | null,
    public readonly closingAmountUSD: number | null,
    public readonly expectedCashUSD: number | null,
    public readonly differenceUSD: number | null,
    public readonly notes: string | null,
  ) {}

  static open(input: CreateCashRegisterInput): CashRegister {
    if (input.openingAmountUSD < 0) {
      throw new Error('El monto inicial de caja no puede ser negativo');
    }
    return new CashRegister(
      randomUUID(),
      input.tenantId,
      input.cashierId,
      Number(input.openingAmountUSD.toFixed(2)),
      new Date(),
      'OPEN',
      null,
      null,
      null,
      null,
      null,
    );
  }

  close(input: {
    closingAmountUSD: number;
    expectedCashUSD: number;
    notes?: string | null;
  }): CashRegister {
    if (this.status !== 'OPEN') {
      throw new ShiftAlreadyClosedException(this.id);
    }
    if (input.closingAmountUSD < 0) {
      throw new Error('El monto final de caja no puede ser negativo');
    }
    const differenceUSD = Number(
      (input.closingAmountUSD - input.expectedCashUSD).toFixed(2),
    );
    return new CashRegister(
      this.id,
      this.tenantId,
      this.cashierId,
      this.openingAmountUSD,
      this.openedAt,
      'CLOSED',
      new Date(),
      Number(input.closingAmountUSD.toFixed(2)),
      Number(input.expectedCashUSD.toFixed(2)),
      differenceUSD,
      input.notes?.trim() || null,
    );
  }
}
