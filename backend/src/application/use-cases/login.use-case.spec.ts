import { LoginUseCase } from './login.use-case';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import type { IPasswordHasher } from '../services/password-hasher.service';
import type { ITokenService } from '../services/token.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  const userRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    existsByEmail: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };
  const tenantRepository: jest.Mocked<ITenantRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
  };
  const passwordHasher: jest.Mocked<IPasswordHasher> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const tokenService: jest.Mocked<ITokenService> = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const activeUser = {
    id: 'u1',
    tenantId: 't1',
    name: 'Ana',
    email: 'ana@tienda.com',
    passwordHash: 'hashed',
    role: 'CASHIER' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(
      userRepository,
      tenantRepository,
      passwordHasher,
      tokenService,
    );
  });

  it('devuelve el token y los datos de sesion si las credenciales son validas', async () => {
    userRepository.findByEmail.mockResolvedValue(activeUser);
    passwordHasher.compare.mockResolvedValue(true);
    tenantRepository.findById.mockResolvedValue({
      id: 't1',
      name: 'Tienda',
      email: 't@tienda.com',
      phone: null,
      businessName: null,
      plan: 'FREE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    tokenService.sign.mockResolvedValue('jwt-token');

    const result = await useCase.execute({
      email: 'ANA@tienda.com',
      password: 'clave',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('ana@tienda.com');
    expect(passwordHasher.compare).toHaveBeenCalledWith('clave', 'hashed');
    expect(tokenService.sign).toHaveBeenCalledWith({
      sub: 'u1',
      tenantId: 't1',
      role: 'CASHIER',
      email: 'ana@tienda.com',
    });
    expect(result.accessToken).toBe('jwt-token');
    expect(result.tenant?.name).toBe('Tienda');
  });

  it('lanza InvalidCredentialsException si el usuario no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'x@y.com', password: 'clave' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('lanza InvalidCredentialsException si el usuario esta inactivo', async () => {
    userRepository.findByEmail.mockResolvedValue({
      ...activeUser,
      isActive: false,
    });

    await expect(
      useCase.execute({ email: 'ana@tienda.com', password: 'clave' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('lanza InvalidCredentialsException si la contrasena es incorrecta', async () => {
    userRepository.findByEmail.mockResolvedValue(activeUser);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'ana@tienda.com', password: 'mala' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('no consulta el tenant si el usuario es SUPER_ADMIN (tenantId null)', async () => {
    userRepository.findByEmail.mockResolvedValue({
      ...activeUser,
      tenantId: null,
      role: 'SUPER_ADMIN',
    });
    passwordHasher.compare.mockResolvedValue(true);
    tokenService.sign.mockResolvedValue('jwt-token');

    const result = await useCase.execute({
      email: 'root@saas.com',
      password: 'clave',
    });

    expect(tenantRepository.findById).not.toHaveBeenCalled();
    expect(result.tenant).toBeNull();
    expect(result.accessToken).toBe('jwt-token');
  });
});
