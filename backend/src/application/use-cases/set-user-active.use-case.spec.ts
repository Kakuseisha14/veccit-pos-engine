import { SetUserActiveUseCase } from './set-user-active.use-case';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { CannotDeactivateSelfException } from '../../domain/exceptions/cannot-deactivate-self.exception';
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

describe('SetUserActiveUseCase', () => {
  let useCase: SetUserActiveUseCase;
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
    useCase = new SetUserActiveUseCase(userRepository);
  });

  it('lanza CannotDeactivateSelfException si el actor intenta desactivarse a sí mismo', async () => {
    await expect(
      useCase.execute({
        tenantId: 't1',
        userId: 'me',
        actorId: 'me',
        isActive: false,
      }),
    ).rejects.toThrow(CannotDeactivateSelfException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('desactiva a otro usuario del tenant', async () => {
    const target = buildUser({ id: 'u2', isActive: true });
    userRepository.findByTenantAndId.mockResolvedValue(target);

    const result = await useCase.execute({
      tenantId: 't1',
      userId: 'u2',
      actorId: 'u1',
      isActive: false,
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(result.user.isActive).toBe(false);
  });

  it('reactiva un usuario desactivado', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(
      buildUser({ id: 'u2', isActive: false }),
    );

    const result = await useCase.execute({
      tenantId: 't1',
      userId: 'u2',
      actorId: 'u1',
      isActive: true,
    });

    expect(result.user.isActive).toBe(true);
  });

  it('lanza UserNotFoundException si el usuario no existe en el tenant', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tenantId: 't1',
        userId: 'desconocido',
        actorId: 'u1',
        isActive: false,
      }),
    ).rejects.toThrow(UserNotFoundException);
  });
});
