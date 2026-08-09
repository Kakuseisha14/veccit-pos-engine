import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type {
  ITokenService,
  TokenPayload,
} from '../../application/services/token.service';

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: JwtSignOptions['expiresIn'];

  constructor(
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.secret = config.get<string>('JWT_SECRET', 'dev-secret-do-not-use');
    this.expiresIn = config.get<string>(
      'JWT_EXPIRES_IN',
      '7d',
    ) as JwtSignOptions['expiresIn'];
  }

  async sign(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: this.expiresIn,
    });
  }

  async verify(token: string): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.secret,
      });
      if (!payload.sub || !payload.role) {
        throw new UnauthorizedException('Token invalido');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }
}
