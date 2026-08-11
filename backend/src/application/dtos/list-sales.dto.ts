import type { SaleOutput } from './sale.dto';

export interface ListSalesInput {
  tenantId: string;
}

export interface ListSalesOutput {
  sales: SaleOutput[];
}
