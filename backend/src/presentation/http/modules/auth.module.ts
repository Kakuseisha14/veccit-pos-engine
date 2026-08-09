import { Module } from '@nestjs/common';
import { GetCurrentSessionUseCase } from '../../../application/use-cases/get-current-session.use-case';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RegisterTenantUseCase } from '../../../application/use-cases/register-tenant.use-case';
import { AuthController } from '../controllers/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [RegisterTenantUseCase, LoginUseCase, GetCurrentSessionUseCase],
})
export class AuthModule {}
