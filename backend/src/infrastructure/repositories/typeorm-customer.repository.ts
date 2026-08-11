import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository';
import type { Customer } from '../../domain/entities/customer.entity';
import { CustomerEntity } from '../persistence/entities/customer.entity';
import {
  toDomainCustomer,
  toEntityCustomer,
} from '../persistence/mappers/customer.mapper';

@Injectable()
export class TypeOrmCustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly repository: Repository<CustomerEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? toDomainCustomer(entity) : null;
  }

  async findByTenantAndId(
    tenantId: string,
    id: string,
  ): Promise<Customer | null> {
    const entity = await this.repository.findOneBy({ tenantId, id });
    return entity ? toDomainCustomer(entity) : null;
  }

  async findByTenantAndIdentification(
    tenantId: string,
    identification: string,
  ): Promise<Customer | null> {
    const entity = await this.repository.findOneBy({
      tenantId,
      identification,
    });
    return entity ? toDomainCustomer(entity) : null;
  }

  async listByTenant(tenantId: string): Promise<Customer[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
    return entities.map(toDomainCustomer);
  }

  async save(customer: Customer): Promise<Customer> {
    await this.repository.save(toEntityCustomer(customer));
    return customer;
  }
}
