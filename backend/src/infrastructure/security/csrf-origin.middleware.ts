import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfOriginMiddleware implements NestMiddleware {
  constructor(private readonly config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const method = (req.method ?? 'GET').toUpperCase();
    if (SAFE_METHODS.has(method)) {
      next();
      return;
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // Sin Origin ni Referer (curl, scripts, supertest): no hay navegador
    // que pueda lanzar una peticion forjada, se permite.
    if (!origin && !referer) {
      next();
      return;
    }

    const source = origin ?? referer ?? '';
    if (!this.isAllowed(source)) {
      res.status(403).json({
        statusCode: 403,
        message: 'Origen no permitido (proteccion CSRF)',
      });
      return;
    }

    next();
  }

  private isAllowed(source: string): boolean {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';
    const configured =
      this.config.get<string>('corsOrigin') ?? 'http://localhost:3000';

    if (isProduction) {
      return source === configured;
    }

    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(source)) {
      return true;
    }

    return source === configured;
  }
}
