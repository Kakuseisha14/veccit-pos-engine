import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { RegisterTenantUseCase } from '../../../application/use-cases/register-tenant.use-case';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { GetCurrentSessionUseCase } from '../../../application/use-cases/get-current-session.use-case';
import type { TokenPayload } from '../../../application/services/token.service';
import { RegisterTenantRequestDto } from '../../dtos/register-tenant.request';
import { LoginRequestDto } from '../../dtos/login.request';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../guards/jwt-auth.guard';

const COOKIE_NAME = 'access_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerTenantUseCase: RegisterTenantUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentSessionUseCase: GetCurrentSessionUseCase,
    private readonly config: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Registrar un nuevo comercio (tenant) con su admin',
  })
  @Post('register-tenant')
  registerTenant(@Body() dto: RegisterTenantRequestDto) {
    return this.registerTenantUseCase.execute({
      tenantName: dto.tenantName,
      email: dto.email,
      password: dto.password,
      tenantAdminName: dto.tenantAdminName,
      phone: dto.phone,
      businessName: dto.businessName,
    });
  }

  @ApiOperation({ summary: 'Iniciar sesión (setea cookie HttpOnly)' })
  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });

    res.cookie(COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SEVEN_DAYS_MS,
    });

    return { user: result.user, tenant: result.tenant };
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Obtener sesión actual del usuario autenticado' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthenticatedRequest) {
    const payload = req.user as TokenPayload;
    return this.getCurrentSessionUseCase.execute(payload);
  }
}
