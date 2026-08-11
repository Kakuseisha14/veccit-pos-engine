import { ListCustomersUseCase } from './list-customers.use-case';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository';
import { Customer } from '../../domain/entities/customer.entity';

describe('ListCustomersUseCase', () => {
  let useCase: ListCustomersUseCase;
  const customerRepository: jest.Mocked<ICustomerRepository> = {
    findById: jest.fn(),
    findByTenantAndId: jest.fn(),
    findByTenantAndIdentification: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListCustomersUseCase(customerRepository);
  });

  it('lista los clientes del tenant mapeados al DTO de salida', async () => {
    const customer = new Customer(
      'c1',
      'tenant-1',
      'V-12345678',
      'Juan Perez',
      null,
      null,
      null,
      new Date(),
      new Date(),
    );
    customerRepository.listByTenant.mockResolvedValue([customer]);

    const result = await useCase.execute({ tenantId: 'tenant-1' });

    expect(customerRepository.listByTenant).toHaveBeenCalledWith('tenant-1');
    expect(result.customers).toHaveLength(1);
    expect(result.customers[0]).toEqual({
      id: customer.id,
      identification: customer.identification,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
    });
  });
});
