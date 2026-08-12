import { CreateUserUseCase } from './create-user.use-case';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { IPasswordHasher } from '../services/password-hasher.service';
import { EmailAlreadyInUseException } from '../../domain/exceptions/email-already-in-use.exception';
import { InvalidRoleException } from '../../domain/exceptions/invalid-role.exception';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
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
    tenantId: 't1',
    name: 'Pedro',
    email: 'Pedro@tienda.com',
    password: 'claveSegura1',
    role: 'CASHIER' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateUserUseCase(userRepository, passwordHasher);
  });

  it('crea un usuario con rol CASHIER dentro del tenant', async () => {
    userRepository.existsByEmail.mockResolvedValue(false);
    passwordHasher.hash.mockResolvedValue('hashed-password');

    const result = await useCase.execute(validInput);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(passwordHasher.hash).toHaveBeenCalledWith('claveSegura1');
    expect(result.user.role).toBe('CASHIER');
    expect(result.user.tenantId).toBe('t1');
    expect(result.user.email).toBe('pedro@tienda.com');
  });

  it('lanza EmailAlreadyInUseException si el email ya existe', async () => {
    userRepository.existsByEmail.mockResolvedValue(true);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      EmailAlreadyInUseException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('lanza InvalidRoleException si se intenta crear un SUPER_ADMIN', async () => {
    await expect(
      useCase.execute({ ...validInput, role: 'SUPER_ADMIN' }),
    ).rejects.toThrow(InvalidRoleException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
