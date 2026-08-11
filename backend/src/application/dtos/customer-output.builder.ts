import type { Customer } from '../../domain/entities/customer.entity';
import type { CustomerOutput } from '../dtos/customer.dto';

export function toCustomerOutput(customer: Customer): CustomerOutput {
  return {
    id: customer.id,
    identification: customer.identification,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    createdAt: customer.createdAt,
  };
}
