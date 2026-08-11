import type { CustomerOutput } from './customer.dto';

export interface QuickRegisterCustomerInput {
  tenantId: string;
  identification: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface QuickRegisterCustomerOutput {
  customer: CustomerOutput;
}
