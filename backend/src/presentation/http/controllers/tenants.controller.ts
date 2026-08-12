import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListTenantsUseCase } from '../../../application/use-cases/list-tenants.use-case';
import { UpdateTenantUseCase } from '../../../application/use-cases/update-tenant.use-case';
import { TenantNotFoundException } from '../../../domain/exceptions/tenant-not-found.exception';
import { UpdateTenantRequestDto } from '../../dtos/update-tenant.request';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@ApiTags('Tenants')
@ApiCookieAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class TenantsController {
  constructor(
    private readonly listTenantsUseCase: ListTenantsUseCase,
    private readonly updateTenantUseCase: UpdateTenantUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar todos los comercios registrados' })
  @Get()
  list() {
    return this.listTenantsUseCase.execute();
  }

  @ApiOperation({ summary: 'Actualizar plan y/o estado de un comercio' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTenantRequestDto) {
    try {
      return await this.updateTenantUseCase.execute({
        tenantId: id,
        plan: dto.plan as 'FREE' | 'PRO' | undefined,
        isActive: dto.isActive,
      });
    } catch (err) {
      if (err instanceof TenantNotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw err;
    }
  }
}
