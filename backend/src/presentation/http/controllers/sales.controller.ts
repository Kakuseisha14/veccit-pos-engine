import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProcessSaleUseCase } from '../../../application/use-cases/process-sale.use-case';
import { ListSalesUseCase } from '../../../application/use-cases/list-sales.use-case';
import { VoidSaleUseCase } from '../../../application/use-cases/void-sale.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { ProcessSaleRequestDto } from '../../dtos/process-sale.request';
import { VoidSaleRequestDto } from '../../dtos/void-sale.request';
import { JwtAuthGuard, AuthenticatedRequest } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';
import { SaleNotFoundException } from '../../../domain/exceptions/sale-not-found.exception';
import { SaleAlreadyVoidedException } from '../../../domain/exceptions/sale-already-voided.exception';

@ApiTags('Sales')
@ApiCookieAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SalesController {
  constructor(
    private readonly processSaleUseCase: ProcessSaleUseCase,
    private readonly listSalesUseCase: ListSalesUseCase,
    private readonly voidSaleUseCase: VoidSaleUseCase,
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

  @ApiOperation({
    summary: 'Anular venta y reponer stock (exclusivo TENANT_ADMIN)',
  })
  @Post(':id/void')
  @Roles('TENANT_ADMIN')
  async voidSale(
    @Param('id') id: string,
    @Body() dto: VoidSaleRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user?.sub;
    if (!userId) {
      throw new ForbiddenException('No se pudo identificar al usuario');
    }
    try {
      return await this.voidSaleUseCase.execute({
        tenantId: this.requireTenantId(),
        saleId: id,
        voidedByUserId: userId,
        reason: dto.reason,
      });
    } catch (error) {
      if (error instanceof SaleNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof SaleAlreadyVoidedException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
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
