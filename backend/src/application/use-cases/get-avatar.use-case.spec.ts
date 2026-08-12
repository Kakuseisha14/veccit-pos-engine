import { Readable } from 'node:stream';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GetAvatarUseCase } from './get-avatar.use-case';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { IAvatarStorageService } from '../services/avatar-storage.service';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { AvatarNotFoundException } from '../../domain/exceptions/avatar-not-found.exception';
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

describe('GetAvatarUseCase', () => {
  let useCase: GetAvatarUseCase;
  const userRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByTenantAndId: jest.fn(),
    existsByEmail: jest.fn(),
    listByTenant: jest.fn(),
    listByRole: jest.fn(),
    save: jest.fn(),
  };
  const avatarStorage: jest.Mocked<IAvatarStorageService> = {
    save: jest.fn(),
    remove: jest.fn(),
    resolveAbsolutePath: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetAvatarUseCase(userRepository, avatarStorage);
  });

  it('retorna el stream del avatar y el content type correcto', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'veccit-avatar-'));
    const filePath = join(dir, 'u1.png');
    await writeFile(filePath, Buffer.from('fake-png-data'));
    userRepository.findByTenantAndId.mockResolvedValue(
      buildUser({ avatarUrl: '/uploads/avatars/t1/u1.png' }),
    );
    avatarStorage.resolveAbsolutePath.mockResolvedValue(filePath);

    const output = await useCase.execute({ tenantId: 't1', userId: 'u1' });

    expect(avatarStorage.resolveAbsolutePath).toHaveBeenCalledWith(
      '/uploads/avatars/t1/u1.png',
      't1',
    );
    expect(output.contentType).toBe('image/png');
    expect(output.stream).toBeInstanceOf(Readable);

    await new Promise<void>((resolve, reject) => {
      output.stream.on('data', () => {});
      output.stream.on('end', resolve);
      output.stream.on('error', reject);
      output.stream.resume();
    });
    await rm(dir, { recursive: true, force: true });
  });

  it('lanza UserNotFoundException si el usuario no existe', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(null);

    await expect(
      useCase.execute({ tenantId: 't1', userId: 'u99' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('lanza AvatarNotFoundException si el usuario no tiene avatar', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(buildUser());

    await expect(
      useCase.execute({ tenantId: 't1', userId: 'u1' }),
    ).rejects.toThrow(AvatarNotFoundException);
  });

  it('lanza AvatarNotFoundException si el archivo no se puede resolver', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(
      buildUser({ avatarUrl: '/uploads/avatars/t1/u1.png' }),
    );
    avatarStorage.resolveAbsolutePath.mockResolvedValue(null);

    await expect(
      useCase.execute({ tenantId: 't1', userId: 'u1' }),
    ).rejects.toThrow(AvatarNotFoundException);
  });

  it('lanza AvatarNotFoundException si el archivo no existe en el disco', async () => {
    userRepository.findByTenantAndId.mockResolvedValue(
      buildUser({ avatarUrl: '/uploads/avatars/t1/u1.png' }),
    );
    avatarStorage.resolveAbsolutePath.mockResolvedValue('C:/no/existe/u1.png');

    await expect(
      useCase.execute({ tenantId: 't1', userId: 'u1' }),
    ).rejects.toThrow(AvatarNotFoundException);
  });
});
