import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PASSWORD_HASHER } from '../../application/services/password-hasher.service';
import { TOKEN_SERVICE } from '../../application/services/token.service';
import { JwtAuthGuard } from '../../presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../presentation/http/guards/roles.guard';
import { TenantGuard } from '../../presentation/http/guards/tenant.guard';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';
import { JwtTokenService } from './jwt-token.service';
import { SuperAdminBootstrapService } from './super-admin-bootstrap';

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100,
      },
    ]),
  ],
  providers: [
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    JwtAuthGuard,
    RolesGuard,
    TenantGuard,
    SuperAdminBootstrapService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [
    PASSWORD_HASHER,
    TOKEN_SERVICE,
    JwtAuthGuard,
    RolesGuard,
    TenantGuard,
  ],
})
export class SecurityModule {}
