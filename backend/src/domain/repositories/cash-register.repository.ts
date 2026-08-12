import type { CashRegister } from '../entities/cash-register.entity';

export interface ICashRegisterRepository {
  findOpenByTenantAndCashier(
    tenantId: string,
    cashierId: string,
  ): Promise<CashRegister | null>;
  findByTenantAndId(tenantId: string, id: string): Promise<CashRegister | null>;
  listByTenant(tenantId: string): Promise<CashRegister[]>;
  save(shift: CashRegister): Promise<CashRegister>;
}

export const CASH_REGISTER_REPOSITORY = Symbol('ICashRegisterRepository');
