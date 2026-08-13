import type { NextFunction, Request, Response } from 'express';
import type { ConfigService } from '@nestjs/config';
import { CsrfOriginMiddleware } from './csrf-origin.middleware';

describe('CsrfOriginMiddleware', () => {
  let middleware: CsrfOriginMiddleware;
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') return 'development';
      if (key === 'corsOrigin') return 'http://localhost:3000';
      return undefined;
    }),
  };

  const buildContext = (): {
    req: {
      method: string;
      headers: Record<string, string | undefined>;
    };
    res: Partial<Response>;
    next: jest.Mock;
  } => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return {
      req: { method: 'POST', headers: {} },
      res,
      next: jest.fn(),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = new CsrfOriginMiddleware(config as unknown as ConfigService);
  });

  it('permite metodos seguros (GET) sin validar origen', () => {
    const ctx = buildContext();
    ctx.req.method = 'GET';
    ctx.req.headers.origin = 'https://evil.example.com';

    middleware.use(
      ctx.req as unknown as Request,
      ctx.res as Response,
      ctx.next as NextFunction,
    );

    expect(ctx.next).toHaveBeenCalledTimes(1);
    expect(ctx.res.status).not.toHaveBeenCalled();
  });

  it('permite mutaciones sin Origin ni Referer (curl/supertest)', () => {
    const ctx = buildContext();

    middleware.use(
      ctx.req as unknown as Request,
      ctx.res as Response,
      ctx.next as NextFunction,
    );

    expect(ctx.next).toHaveBeenCalledTimes(1);
    expect(ctx.res.status).not.toHaveBeenCalled();
  });

  it('permite mutaciones con Origin permitido en dev (localhost)', () => {
    const ctx = buildContext();
    ctx.req.headers.origin = 'http://localhost:3001';

    middleware.use(
      ctx.req as unknown as Request,
      ctx.res as Response,
      ctx.next as NextFunction,
    );

    expect(ctx.next).toHaveBeenCalledTimes(1);
    expect(ctx.res.status).not.toHaveBeenCalled();
  });

  it('bloquea mutaciones con Origin foraneo devolviendo 403', () => {
    const ctx = buildContext();
    ctx.req.headers.origin = 'https://evil.example.com';

    middleware.use(
      ctx.req as unknown as Request,
      ctx.res as Response,
      ctx.next as NextFunction,
    );

    expect(ctx.next).not.toHaveBeenCalled();
    expect(ctx.res.status).toHaveBeenCalledWith(403);
    expect(ctx.res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Origen no permitido (proteccion CSRF)',
      }),
    );
  });

  it('en produccion solo acepta el origen configurado (CORS_ORIGIN)', () => {
    const prodConfig = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'corsOrigin') return 'https://admin.mitienda.com';
        return undefined;
      }),
    };
    middleware = new CsrfOriginMiddleware(
      prodConfig as unknown as ConfigService,
    );

    const evil = buildContext();
    evil.req.headers.origin = 'http://localhost:3001';
    middleware.use(
      evil.req as Request,
      evil.res as Response,
      evil.next as NextFunction,
    );
    expect(evil.res.status).toHaveBeenCalledWith(403);

    const allowed = buildContext();
    allowed.req.headers.origin = 'https://admin.mitienda.com';
    middleware.use(
      allowed.req as Request,
      allowed.res as Response,
      allowed.next as NextFunction,
    );
    expect(allowed.next).toHaveBeenCalledTimes(1);
  });
});
