import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { ITokenService } from '../../../application/services/token.service';
import { TOKEN_SERVICE } from '../../../application/services/token.service';

export interface AuthenticatedRequest {
  user?: import('../../../application/services/token.service').TokenPayload;
  cookies?: Record<string, string | undefined>;
}

const COOKIE_NAME = 'access_token';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Sesion no iniciada');
    }

    try {
      request.user = await this.tokenService.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }
}
