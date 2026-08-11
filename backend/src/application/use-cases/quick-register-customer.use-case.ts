import { Inject, Injectable } from '@nestjs/common';
import type {
  QuickRegisterCustomerInput,
  QuickRegisterCustomerOutput,
} from '../dtos/quick-register-customer.dto';
import { toCustomerOutput } from '../dtos/customer-output.builder';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerAlreadyExistsException } from '../../domain/exceptions/customer-already-exists.exception';

@Injectable()
export class QuickRegisterCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(
    input: QuickRegisterCustomerInput,
  ): Promise<QuickRegisterCustomerOutput> {
    const identification = input.identification.trim().toUpperCase();

    const existing =
      await this.customerRepository.findByTenantAndIdentification(
        input.tenantId,
        identification,
      );
    if (existing) {
      throw new CustomerAlreadyExistsException(identification);
    }

    const customer = Customer.create({ ...input, identification });
    const saved = await this.customerRepository.save(customer);

    return { customer: toCustomerOutput(saved) };
  }
}
