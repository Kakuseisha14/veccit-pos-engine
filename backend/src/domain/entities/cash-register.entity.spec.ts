import { CashRegister } from './cash-register.entity';
import { ShiftAlreadyClosedException } from '../exceptions/shift-already-closed.exception';

describe('CashRegister', () => {
  it('abre un turno con monto inicial y estado OPEN', () => {
    const shift = CashRegister.open({
      tenantId: 'tenant-1',
      cashierId: 'user-1',
      openingAmountUSD: 50.5,
    });

    expect(shift.status).toBe('OPEN');
    expect(shift.openingAmountUSD).toBe(50.5);
    expect(shift.openedAt).toBeInstanceOf(Date);
    expect(shift.closedAt).toBeNull();
    expect(shift.closingAmountUSD).toBeNull();
    expect(shift.expectedCashUSD).toBeNull();
    expect(shift.differenceUSD).toBeNull();
  });

  it('redondea el monto inicial a 2 decimales', () => {
    const shift = CashRegister.open({
      tenantId: 'tenant-1',
      cashierId: 'user-1',
      openingAmountUSD: 50.556,
    });

    expect(shift.openingAmountUSD).toBe(50.56);
  });

  it('rechaza un monto inicial negativo', () => {
    expect(() =>
      CashRegister.open({
        tenantId: 'tenant-1',
        cashierId: 'user-1',
        openingAmountUSD: -5,
      }),
    ).toThrow('no puede ser negativo');
  });

  it('cierra el turno calculando la diferencia contra el efectivo esperado', () => {
    const shift = CashRegister.open({
      tenantId: 'tenant-1',
      cashierId: 'user-1',
      openingAmountUSD: 50,
    });

    const closed = shift.close({
      closingAmountUSD: 182.5,
      expectedCashUSD: 180,
      notes: 'Caja sin novedad',
    });

    expect(closed.status).toBe('CLOSED');
    expect(closed.closedAt).toBeInstanceOf(Date);
    expect(closed.closingAmountUSD).toBe(182.5);
    expect(closed.expectedCashUSD).toBe(180);
    expect(closed.differenceUSD).toBe(2.5);
    expect(closed.notes).toBe('Caja sin novedad');
    expect(closed.id).toBe(shift.id);
  });

  it('lanza ShiftAlreadyClosedException al intentar cerrar un turno cerrado', () => {
    const shift = CashRegister.open({
      tenantId: 'tenant-1',
      cashierId: 'user-1',
      openingAmountUSD: 50,
    });
    const closed = shift.close({
      closingAmountUSD: 100,
      expectedCashUSD: 100,
    });

    expect(() =>
      closed.close({ closingAmountUSD: 100, expectedCashUSD: 100 }),
    ).toThrow(ShiftAlreadyClosedException);
  });

  it('rechaza un monto final negativo', () => {
    const shift = CashRegister.open({
      tenantId: 'tenant-1',
      cashierId: 'user-1',
      openingAmountUSD: 50,
    });

    expect(() =>
      shift.close({ closingAmountUSD: -1, expectedCashUSD: 0 }),
    ).toThrow('no puede ser negativo');
  });
});
