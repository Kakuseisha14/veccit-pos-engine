import { RegisterTenantUseCase } from './register-tenant.use-case';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { IPasswordHasher } from '../services/password-hasher.service';
import { TenantAlreadyExistsException } from '../../domain/exceptions/tenant-already-exists.exception';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';

describe('RegisterTenantUseCase', () => {
  let useCase: RegisterTenantUseCase;
  const tenantRepository: jest.Mocked<ITenantRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    list: jest.fn(),
    save: jest.fn(),
  };
  const userRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByTenantAndId: jest.fn(),
    existsByEmail: jest.fn(),
    listByTenant: jest.fn(),
    listByRole: jest.fn(),
    save: jest.fn(),
  };
  const passwordHasher: jest.Mocked<IPasswordHasher> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const validInput = {
    tenantName: 'Mi Tienda',
    email: 'Admin@Test.com',
    password: 'claveSegura1',
    tenantAdminName: 'Ana',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterTenantUseCase(
      tenantRepository,
      userRepository,
      passwordHasher,
    );
  });

  it('crea un tenant y su usuario administrador', async () => {
    tenantRepository.findByEmail.mockResolvedValue(null);
    userRepository.existsByEmail.mockResolvedValue(false);
    passwordHasher.hash.mockResolvedValue('hashed-password');

    const result = await useCase.execute(validInput);

    expect(tenantRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(passwordHasher.hash).toHaveBeenCalledWith('claveSegura1');
    expect(result.tenant.plan).toBe('FREE');
    expect(result.user.role).toBe('TENANT_ADMIN');
    expect(result.user.email).toBe('admin@test.com');
    expect(result.user.tenantId).toBe(result.tenant.id);
  });

  it('lanza TenantAlreadyExistsException si el email del tenant ya existe', async () => {
    tenantRepository.findByEmail.mockResolvedValue({ id: 'existing' } as never);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      TenantAlreadyExistsException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('lanza EmailAlreadyInUseException si el email ya esta en uso por un usuario', async () => {
    tenantRepository.findByEmail.mockResolvedValue(null);
    userRepository.existsByEmail.mockResolvedValue(true);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      EmailAlreadyInUseException,
    );
    expect(tenantRepository.save).not.toHaveBeenCalled();
  });

  it('crea el tenant con el plan indicado si se recibe', async () => {
    tenantRepository.findByEmail.mockResolvedValue(null);
    userRepository.existsByEmail.mockResolvedValue(false);
    passwordHasher.hash.mockResolvedValue('hashed-password');

    const result = await useCase.execute({ ...validInput, plan: 'PRO' });

    expect(result.tenant.plan).toBe('PRO');
  });
});
