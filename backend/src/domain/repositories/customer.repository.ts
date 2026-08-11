import type { Customer } from '../entities/customer.entity';

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByTenantAndId(tenantId: string, id: string): Promise<Customer | null>;
  findByTenantAndIdentification(
    tenantId: string,
    identification: string,
  ): Promise<Customer | null>;
  listByTenant(tenantId: string): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
}

export const CUSTOMER_REPOSITORY = Symbol('ICustomerRepository');
