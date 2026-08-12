import type { Sale } from '../entities/sale.entity';

export interface ISaleRepository {
  findById(id: string): Promise<Sale | null>;
  findByTenantAndId(tenantId: string, id: string): Promise<Sale | null>;
  listByTenant(tenantId: string): Promise<Sale[]>;
  listByShift(tenantId: string, shiftId: string): Promise<Sale[]>;
  nextSaleNumber(tenantId: string): Promise<string>;
  save(sale: Sale): Promise<Sale>;
}

export const SALE_REPOSITORY = Symbol('ISaleRepository');
