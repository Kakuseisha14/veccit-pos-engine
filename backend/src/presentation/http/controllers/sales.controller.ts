import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProcessSaleUseCase } from '../../../application/use-cases/process-sale.use-case';
import { ListSalesUseCase } from '../../../application/use-cases/list-sales.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { ProcessSaleRequestDto } from '../../dtos/process-sale.request';
import { JwtAuthGuard, AuthenticatedRequest } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';

@ApiTags('Sales')
@ApiCookieAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SalesController {
  constructor(
    private readonly processSaleUseCase: ProcessSaleUseCase,
    private readonly listSalesUseCase: ListSalesUseCase,
  ) {}

  @ApiOperation({
    summary:
      'Procesar venta con pagos mixtos USD/VES en transaccion ACID (TENANT_ADMIN / CASHIER)',
  })
  @Post()
  @Roles('TENANT_ADMIN', 'CASHIER')
  process(
    @Body() dto: ProcessSaleRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new ForbiddenException('No se pudo identificar al usuario');
    }
    return this.processSaleUseCase.execute({
      tenantId: this.requireTenantId(),
      userId,
      ...dto,
    });
  }

  @ApiOperation({
    summary: 'Listar ventas del inquilino (TENANT_ADMIN / CASHIER)',
  })
  @Get()
  @Roles('TENANT_ADMIN', 'CASHIER')
  list() {
    return this.listSalesUseCase.execute({
      tenantId: this.requireTenantId(),
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
