import { ChangePasswordUseCase } from './change-password.use-case';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { IPasswordHasher } from '../services/password-hasher.service';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import type { Role } from '../../domain/value-objects/role';

function buildUser(overrides: Partial<User> = {}): User {
  const base = new User(
    'u1',
    't1',
    'Ana',
    'ana@tienda.com',
    'old-hash',
    'TENANT_ADMIN' as Role,
    true,
    null,
    new Date('2026-01-01T00:00:00Z'),
    new Date('2026-01-01T00:00:00Z'),
  );
  return new User(
    overrides.id ?? base.id,
    overrides.tenantId === undefined ? base.tenantId : overrides.tenantId,
    overrides.name ?? base.name,
    overrides.email ?? base.email,
    overrides.passwordHash ?? base.passwordHash,
    overrides.role ?? base.role,
    overrides.isActive ?? base.isActive,
    overrides.avatarUrl === undefined ? base.avatarUrl : overrides.avatarUrl,
    overrides.createdAt ?? base.createdAt,
    overrides.updatedAt ?? base.updatedAt,
  );
}

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
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
    userId: 'u1',
    currentPassword: 'claveVieja',
    newPassword: 'claveNuevaSegura1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ChangePasswordUseCase(userRepository, passwordHasher);
  });

  it('cambia la contrasena si la actual es correcta', async () => {
    userRepository.findById.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(true);
    passwordHasher.hash.mockResolvedValue('new-hash');

    const result = await useCase.execute(validInput);

    expect(passwordHasher.compare).toHaveBeenCalledWith(
      'claveVieja',
      'old-hash',
    );
    expect(passwordHasher.hash).toHaveBeenCalledWith('claveNuevaSegura1');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save.mock.calls[0][0].passwordHash).toBe('new-hash');
    expect(result.user.id).toBe('u1');
  });

  it('lanza InvalidCredentialsException si la contrasena actual es incorrecta', async () => {
    userRepository.findById.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('lanza UserNotFoundException si el usuario no existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      UserNotFoundException,
    );
    expect(passwordHasher.compare).not.toHaveBeenCalled();
  });
});
