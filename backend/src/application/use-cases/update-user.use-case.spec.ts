import { UpdateUserUseCase } from './update-user.use-case';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidRoleException } from '../../domain/exceptions/invalid-role.exception';
import type { Role } from '../../domain/value-objects/role';

function buildUser(overrides: Partial<User> = {}): User {
  const base = new User(
    'u1',
    't1',
    'Ana',
    'ana@tienda.com',
    'hashed',
    'CASHIER' as Role,
    true,
    null,
    new Date(),
    new Date(),
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

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  const userRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByTenantAndId: jest.fn(),
    existsByEmail: jest.fn(),
    listByTenant: jest.fn(),
    listByRole: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateUserUseCase(userRepository);
  });

  it('actualiza el nombre y el rol del usuario', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(buildUser());

    const result = await useCase.execute({
      tenantId: 't1',
      userId: 'u1',
      name: 'Ana Maria',
      role: 'TENANT_ADMIN',
    });

    expect(userRepository.findByTenantAndId).toHaveBeenCalledWith('t1', 'u1');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(result.user.name).toBe('Ana Maria');
    expect(result.user.role).toBe('TENANT_ADMIN');
  });

  it('actualiza solo el nombre cuando el rol no se envía', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(buildUser());

    const result = await useCase.execute({
      tenantId: 't1',
      userId: 'u1',
      name: 'Ana Maria',
    });

    expect(result.user.name).toBe('Ana Maria');
    expect(result.user.role).toBe('CASHIER');
  });

  it('lanza UserNotFoundException si el usuario no pertence al tenant', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tenantId: 't1',
        userId: 'otro',
        name: 'X',
      }),
    ).rejects.toThrow(UserNotFoundException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('lanza InvalidRoleException si se intenta asignar SUPER_ADMIN', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(buildUser());

    await expect(
      useCase.execute({
        tenantId: 't1',
        userId: 'u1',
        role: 'SUPER_ADMIN',
      }),
    ).rejects.toThrow(InvalidRoleException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
