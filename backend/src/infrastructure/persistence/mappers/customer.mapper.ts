import { Customer } from '../../../domain/entities/customer.entity';
import { CustomerEntity } from '../entities/customer.entity';

export function toDomainCustomer(entity: CustomerEntity): Customer {
  return new Customer(
    entity.id,
    entity.tenantId,
    entity.identification,
    entity.name,
    entity.email,
    entity.phone,
    entity.address,
    entity.createdAt,
    entity.updatedAt,
  );
}

export function toEntityCustomer(customer: Customer): CustomerEntity {
  const entity = new CustomerEntity();
  entity.id = customer.id;
  entity.tenantId = customer.tenantId;
  entity.identification = customer.identification;
  entity.name = customer.name;
  entity.email = customer.email;
  entity.phone = customer.phone;
  entity.address = customer.address;
  entity.createdAt = customer.createdAt;
  entity.updatedAt = customer.updatedAt;
  return entity;
}
