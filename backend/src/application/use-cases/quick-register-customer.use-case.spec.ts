import { QuickRegisterCustomerUseCase } from './quick-register-customer.use-case';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerAlreadyExistsException } from '../../domain/exceptions/customer-already-exists.exception';

describe('QuickRegisterCustomerUseCase', () => {
  let useCase: QuickRegisterCustomerUseCase;
  const customerRepository: jest.Mocked<ICustomerRepository> = {
    findById: jest.fn(),
    findByTenantAndId: jest.fn(),
    findByTenantAndIdentification: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };

  const tenantId = 'tenant-1';

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new QuickRegisterCustomerUseCase(customerRepository);
  });

  it('registra un cliente nuevo normalizando su identificacion', async () => {
    customerRepository.findByTenantAndIdentification.mockResolvedValue(null);
    customerRepository.save.mockImplementation(async (customer) => customer);

    const result = await useCase.execute({
      tenantId,
      identification: ' v-12345678 ',
      name: 'Juan Perez',
      email: 'JUAN@CORREO.COM',
    });

    expect(
      customerRepository.findByTenantAndIdentification,
    ).toHaveBeenCalledWith(tenantId, 'V-12345678');
    expect(result.customer.identification).toBe('V-12345678');
    expect(result.customer.name).toBe('Juan Perez');
    expect(result.customer.email).toBe('juan@correo.com');
  });

  it('lanza CustomerAlreadyExistsException si la identificacion ya existe', async () => {
    const existing = new Customer(
      'c1',
      tenantId,
      'V-12345678',
      'Juan Perez',
      null,
      null,
      null,
      new Date(),
      new Date(),
    );
    customerRepository.findByTenantAndIdentification.mockResolvedValue(
      existing,
    );

    await expect(
      useCase.execute({
        tenantId,
        identification: 'V-12345678',
        name: 'Juan Perez',
      }),
    ).rejects.toThrow(CustomerAlreadyExistsException);
    expect(customerRepository.save).not.toHaveBeenCalled();
  });
});
