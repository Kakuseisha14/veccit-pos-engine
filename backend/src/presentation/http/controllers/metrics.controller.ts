import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetDashboardMetricsUseCase } from '../../../application/use-cases/get-dashboard-metrics.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';

@ApiTags('Metrics')
@ApiCookieAuth()
@Controller('metrics')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class MetricsController {
  constructor(
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
  ) {}

  @ApiOperation({
    summary:
      'Metricas del dashboard: ventas del dia, ganancia bruta USD, mejor producto y serie de 7 dias (exclusivo TENANT_ADMIN)',
  })
  @Get('dashboard')
  @Roles('TENANT_ADMIN')
  dashboard() {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Se requiere un contexto de inquilino (tenant) activo',
      );
    }
    return this.getDashboardMetricsUseCase.execute({ tenantId });
  }
}
