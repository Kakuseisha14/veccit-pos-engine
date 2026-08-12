import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { RegisterTenantUseCase } from '../../../application/use-cases/register-tenant.use-case';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { GetCurrentSessionUseCase } from '../../../application/use-cases/get-current-session.use-case';
import { ChangePasswordUseCase } from '../../../application/use-cases/change-password.use-case';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import type { TokenPayload } from '../../../application/services/token.service';
import { RegisterTenantRequestDto } from '../../dtos/register-tenant.request';
import { LoginRequestDto } from '../../dtos/login.request';
import { ChangePasswordRequestDto } from '../../dtos/change-password.request';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

const COOKIE_NAME = 'access_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerTenantUseCase: RegisterTenantUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentSessionUseCase: GetCurrentSessionUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly config: ConfigService,
  ) {}

  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Registrar un nuevo comercio (tenant) con su admin',
  })
  @Post('register-tenant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  registerTenant(@Body() dto: RegisterTenantRequestDto) {
    return this.registerTenantUseCase.execute({
      tenantName: dto.tenantName,
      email: dto.email,
      password: dto.password,
      tenantAdminName: dto.tenantAdminName,
      phone: dto.phone,
      businessName: dto.businessName,
      plan: dto.plan as 'FREE' | 'PRO' | undefined,
    });
  }

  @ApiOperation({ summary: 'Iniciar sesión (setea cookie HttpOnly)' })
  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    let result: Awaited<ReturnType<LoginUseCase['execute']>>;
    try {
      result = await this.loginUseCase.execute({
        email: dto.email,
        password: dto.password,
      });
    } catch (err) {
      if (err instanceof InvalidCredentialsException) {
        throw new UnauthorizedException(err.message);
      }
      throw err;
    }

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

  @ApiOperation({ summary: 'Cerrar sesión (limpia la cookie HttpOnly)' })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { ok: true };
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'Cambiar la contraseña del usuario autenticado' })
  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordRequestDto,
  ) {
    const payload = req.user as TokenPayload;
    try {
      return await this.changePasswordUseCase.execute({
        userId: payload.sub,
        currentPassword: dto.currentPassword,
        newPassword: dto.newPassword,
      });
    } catch (err) {
      if (err instanceof InvalidCredentialsException) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }
}
