import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SetDailyRateUseCase } from '../../../application/use-cases/set-daily-rate.use-case';
import { GetActiveRateUseCase } from '../../../application/use-cases/get-active-rate.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { SetDailyRateRequestDto } from '../../dtos/set-daily-rate.request';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

@ApiTags('Rates')
@ApiCookieAuth()
@Controller('rates')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class RatesController {
  constructor(
    private readonly setDailyRateUseCase: SetDailyRateUseCase,
    private readonly getActiveRateUseCase: GetActiveRateUseCase,
  ) {}

  @ApiOperation({ summary: 'Definir la tasa del día (USD a VES)' })
  @Post()
  @Roles('TENANT_ADMIN')
  setDailyRate(@Body() dto: SetDailyRateRequestDto) {
    const tenantId = this.requireTenantId();
    return this.setDailyRateUseCase.execute({
      tenantId,
      rateVES: dto.rateVES,
      date: dto.date,
    });
  }

  @ApiOperation({
    summary: 'Obtener la tasa activa (de hoy, o la más reciente)',
  })
  @Get('active')
  @Roles('TENANT_ADMIN', 'CASHIER')
  getActiveRate(@Query('date') date?: string) {
    const tenantId = this.requireTenantId();
    return this.getActiveRateUseCase.execute({
      tenantId,
      date: date ?? todayISO(),
    });
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
