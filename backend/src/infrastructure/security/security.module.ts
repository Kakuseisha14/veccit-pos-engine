import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
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
  imports: [JwtModule.register({})],
  providers: [
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    JwtAuthGuard,
    RolesGuard,
    TenantGuard,
    SuperAdminBootstrapService,
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
