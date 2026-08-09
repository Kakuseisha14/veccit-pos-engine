import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../../application/use-cases/list-users.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { CreateUserRequestDto } from '../../dtos/create-user.request';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';

@ApiTags('Users')
@ApiCookieAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('TENANT_ADMIN')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear un usuario (cajero/admin) del tenant' })
  @Post()
  create(@Body() dto: CreateUserRequestDto) {
    const tenantId = this.requireTenantId();
    return this.createUserUseCase.execute({
      tenantId,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });
  }

  @ApiOperation({ summary: 'Listar usuarios del tenant' })
  @Get()
  list() {
    const tenantId = this.requireTenantId();
    return this.listUsersUseCase.execute(tenantId);
  }

  private requireTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Se requiere un contexto de inquilino (tenant) activo',
      );
    }
    return tenantId;
  }
}
