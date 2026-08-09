import type { Role } from '../../domain/value-objects/role';

export interface TokenPayload {
  sub: string;
  tenantId: string | null;
  role: Role;
  email: string;
}

export interface ITokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}

export const TOKEN_SERVICE = Symbol('ITokenService');
