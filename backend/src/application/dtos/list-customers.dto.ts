import type { CustomerOutput } from './customer.dto';

export interface ListCustomersInput {
  tenantId: string;
}

export interface ListCustomersOutput {
  customers: CustomerOutput[];
}
