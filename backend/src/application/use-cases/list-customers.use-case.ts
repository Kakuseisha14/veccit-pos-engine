import { Inject, Injectable } from '@nestjs/common';
import type {
  ListCustomersInput,
  ListCustomersOutput,
} from '../dtos/list-customers.dto';
import { toCustomerOutput } from '../dtos/customer-output.builder';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository';

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(input: ListCustomersInput): Promise<ListCustomersOutput> {
    const customers = await this.customerRepository.listByTenant(
      input.tenantId,
    );
    return { customers: customers.map(toCustomerOutput) };
  }
}
