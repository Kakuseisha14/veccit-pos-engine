import { CashRegister } from '../../../domain/entities/cash-register.entity';
import { CashRegisterEntity } from '../entities/cash-register.entity';

export function toDomainCashRegister(entity: CashRegisterEntity): CashRegister {
  return new CashRegister(
    entity.id,
    entity.tenantId,
    entity.cashierId,
    parseFloat(entity.openingAmountUSD),
    entity.openedAt,
    entity.status,
    entity.closedAt,
    entity.closingAmountUSD !== null
      ? parseFloat(entity.closingAmountUSD)
      : null,
    entity.expectedCashUSD !== null ? parseFloat(entity.expectedCashUSD) : null,
    entity.differenceUSD !== null ? parseFloat(entity.differenceUSD) : null,
    entity.notes,
  );
}

export function toEntityCashRegister(shift: CashRegister): CashRegisterEntity {
  const entity = new CashRegisterEntity();
  entity.id = shift.id;
  entity.tenantId = shift.tenantId;
  entity.cashierId = shift.cashierId;
  entity.openingAmountUSD = shift.openingAmountUSD.toFixed(2);
  entity.openedAt = shift.openedAt;
  entity.status = shift.status;
  entity.closedAt = shift.closedAt;
  entity.closingAmountUSD =
    shift.closingAmountUSD !== null ? shift.closingAmountUSD.toFixed(2) : null;
  entity.expectedCashUSD =
    shift.expectedCashUSD !== null ? shift.expectedCashUSD.toFixed(2) : null;
  entity.differenceUSD =
    shift.differenceUSD !== null ? shift.differenceUSD.toFixed(2) : null;
  entity.notes = shift.notes;
  return entity;
}
