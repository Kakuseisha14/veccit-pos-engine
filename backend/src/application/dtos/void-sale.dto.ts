import type { SaleOutput } from './sale.dto';

export interface VoidSaleInput {
  tenantId: string;
  saleId: string;
  voidedByUserId: string;
  reason?: string | null;
}

export interface VoidSaleOutput {
  sale: SaleOutput;
}
