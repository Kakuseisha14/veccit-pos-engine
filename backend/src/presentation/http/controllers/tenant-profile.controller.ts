import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateTenantProfileUseCase } from '../../../application/use-cases/update-tenant-profile.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { TenantNotFoundException } from '../../../domain/exceptions/tenant-not-found.exception';
import { UpdateTenantProfileRequestDto } from '../../dtos/update-tenant-profile.request';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';

@ApiTags('Tenants')
@ApiCookieAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, TenantGuard)
export class TenantProfileController {
  constructor(
    private readonly updateTenantProfileUseCase: UpdateTenantProfileUseCase,
  ) {}

  @ApiOperation({ summary: 'Editar los datos del propio comercio' })
  @Patch('me')
  async updateProfile(@Body() dto: UpdateTenantProfileRequestDto) {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Se requiere un contexto de inquilino (tenant) activo',
      );
    }
    try {
      return await this.updateTenantProfileUseCase.execute({
        tenantId,
        name: dto.name,
        phone: dto.phone ?? null,
        businessName: dto.businessName ?? null,
      });
    } catch (err) {
      if (err instanceof TenantNotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw err;
    }
  }
}
