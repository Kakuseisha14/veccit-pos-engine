import { UploadAvatarUseCase } from './upload-avatar.use-case';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { IAvatarStorageService } from '../services/avatar-storage.service';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidAvatarException } from '../../domain/exceptions/invalid-avatar.exception';
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

describe('UploadAvatarUseCase', () => {
  let useCase: UploadAvatarUseCase;
  const userRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByTenantAndId: jest.fn(),
    existsByEmail: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };
  const avatarStorage: jest.Mocked<IAvatarStorageService> = {
    save: jest.fn(),
    remove: jest.fn(),
    resolveAbsolutePath: jest.fn(),
  };

  const pngBuffer = Buffer.from('fake-png-data');

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UploadAvatarUseCase(userRepository, avatarStorage);
  });

  it('guarda el avatar, actualiza el usuario y retorna la URL', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(buildUser());
    avatarStorage.save.mockResolvedValue('/uploads/avatars/t1/u1.png');

    const result = await useCase.execute({
      tenantId: 't1',
      userId: 'u1',
      mimetype: 'image/png',
      size: 1234,
      buffer: pngBuffer,
    });

    expect(avatarStorage.save).toHaveBeenCalledWith({
      tenantId: 't1',
      userId: 'u1',
      extension: 'png',
      buffer: pngBuffer,
    });
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(result.user.avatarUrl).toBe('/uploads/avatars/t1/u1.png');
  });

  it('elimina el avatar anterior cuando existe', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(
      buildUser({ avatarUrl: '/uploads/avatars/t1/u1.jpg' }),
    );
    avatarStorage.save.mockResolvedValue('/uploads/avatars/t1/u1.png');

    await useCase.execute({
      tenantId: 't1',
      userId: 'u1',
      mimetype: 'image/png',
      size: 10,
      buffer: pngBuffer,
    });

    expect(avatarStorage.remove).toHaveBeenCalledWith(
      '/uploads/avatars/t1/u1.jpg',
      't1',
    );
  });

  it('lanza InvalidAvatarException si el mimetype no esta permitido', async () => {
    await expect(
      useCase.execute({
        tenantId: 't1',
        userId: 'u1',
        mimetype: 'image/gif',
        size: 10,
        buffer: pngBuffer,
      }),
    ).rejects.toThrow(InvalidAvatarException);
    expect(avatarStorage.save).not.toHaveBeenCalled();
  });

  it('lanza InvalidAvatarException si el archivo excede 7MB', async () => {
    await expect(
      useCase.execute({
        tenantId: 't1',
        userId: 'u1',
        mimetype: 'image/png',
        size: 8 * 1024 * 1024,
        buffer: pngBuffer,
      }),
    ).rejects.toThrow(InvalidAvatarException);
    expect(avatarStorage.save).not.toHaveBeenCalled();
  });

  it('acepta un archivo de hasta 7MB', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(buildUser());
    avatarStorage.save.mockResolvedValue('/uploads/avatars/t1/u1.png');

    const result = await useCase.execute({
      tenantId: 't1',
      userId: 'u1',
      mimetype: 'image/png',
      size: 7 * 1024 * 1024,
      buffer: pngBuffer,
    });

    expect(avatarStorage.save).toHaveBeenCalledTimes(1);
    expect(result.user.avatarUrl).toBe('/uploads/avatars/t1/u1.png');
  });

  it('lanza InvalidAvatarException si el archivo esta vacio', async () => {
    await expect(
      useCase.execute({
        tenantId: 't1',
        userId: 'u1',
        mimetype: 'image/png',
        size: 0,
        buffer: pngBuffer,
      }),
    ).rejects.toThrow(InvalidAvatarException);
  });

  it('lanza UserNotFoundException si el usuario no existe en el tenant', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tenantId: 't1',
        userId: 'u99',
        mimetype: 'image/png',
        size: 10,
        buffer: pngBuffer,
      }),
    ).rejects.toThrow(UserNotFoundException);
    expect(avatarStorage.save).not.toHaveBeenCalled();
  });
});
