import { UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import type { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RegisterTenantUseCase } from '../../../application/use-cases/register-tenant.use-case';
import { GetCurrentSessionUseCase } from '../../../application/use-cases/get-current-session.use-case';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';

describe('AuthController', () => {
  let controller: AuthController;
  const registerTenantUseCase = { execute: jest.fn() };
  const loginUseCase = { execute: jest.fn() };
  const getCurrentSessionUseCase = { execute: jest.fn() };
  const config = { get: jest.fn().mockReturnValue('development') };

  const buildResponse = (): jest.Mocked<Pick<Response, 'cookie'>> => ({
    cookie: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(
      registerTenantUseCase as unknown as RegisterTenantUseCase,
      loginUseCase as unknown as LoginUseCase,
      getCurrentSessionUseCase as unknown as GetCurrentSessionUseCase,
      config as unknown as ConfigService,
    );
  });

  it('mapea InvalidCredentialsException a UnauthorizedException (HTTP 401)', async () => {
    loginUseCase.execute.mockRejectedValue(new InvalidCredentialsException());
    const res = buildResponse();

    await expect(
      controller.login(
        { email: 'a@b.com', password: 'mala' },
        res as unknown as Response,
      ),
    ).rejects.toThrow(UnauthorizedException);
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('setea la cookie HttpOnly cuando el login es exitoso', async () => {
    loginUseCase.execute.mockResolvedValue({
      accessToken: 'jwt-token',
      user: {
        id: 'u1',
        tenantId: null,
        name: 'Ana',
        email: 'a@b.com',
        role: 'SUPER_ADMIN',
      },
      tenant: null,
    });
    const res = buildResponse();

    const result = await controller.login(
      { email: 'a@b.com', password: 'clave' },
      res as unknown as Response,
    );

    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'jwt-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(result.user.email).toBe('a@b.com');
  });

  it('re-lanza errores que no son de credenciales invalidas', async () => {
    const internalError = new Error('DB caida');
    loginUseCase.execute.mockRejectedValue(internalError);
    const res = buildResponse();

    await expect(
      controller.login(
        { email: 'a@b.com', password: 'clave' },
        res as unknown as Response,
      ),
    ).rejects.toThrow(internalError);
  });
});
