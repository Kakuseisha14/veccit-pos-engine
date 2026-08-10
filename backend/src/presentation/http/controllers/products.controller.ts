import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { AdjustStockUseCase } from '../../../application/use-cases/adjust-stock.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/list-products.use-case';
import { GetLowStockAlertsUseCase } from '../../../application/use-cases/get-low-stock-alerts.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { CreateProductRequestDto } from '../../dtos/create-product.request';
import { UpdateProductRequestDto } from '../../dtos/update-product.request';
import { AdjustStockRequestDto } from '../../dtos/adjust-stock.request';
import { JwtAuthGuard, AuthenticatedRequest } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';

@ApiTags('Products')
@ApiCookieAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly adjustStockUseCase: AdjustStockUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getLowStockAlertsUseCase: GetLowStockAlertsUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear un producto (TENANT_ADMIN)' })
  @Post()
  @Roles('TENANT_ADMIN')
  create(@Body() dto: CreateProductRequestDto) {
    return this.createProductUseCase.execute({
      tenantId: this.requireTenantId(),
      ...dto,
    });
  }

  @ApiOperation({ summary: 'Actualizar un producto (TENANT_ADMIN)' })
  @Patch(':id')
  @Roles('TENANT_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateProductRequestDto) {
    return this.updateProductUseCase.execute({
      tenantId: this.requireTenantId(),
      productId: id,
      ...dto,
    });
  }

  @ApiOperation({
    summary: 'Ajustar stock (entrada positiva / salida negativa)',
  })
  @Post(':id/adjust-stock')
  @Roles('TENANT_ADMIN')
  adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const performedById = request.user?.sub;
    if (!performedById) {
      throw new ForbiddenException('No se pudo identificar al usuario');
    }
    return this.adjustStockUseCase.execute({
      tenantId: this.requireTenantId(),
      productId: id,
      quantity: dto.quantity,
      reason: dto.reason,
      performedById,
    });
  }

  @ApiOperation({
    summary: 'Listar productos (el costo solo se incluye para TENANT_ADMIN)',
  })
  @Get()
  @Roles('TENANT_ADMIN', 'CASHIER')
  list(@Req() request: AuthenticatedRequest) {
    const includeCost = request.user?.role === 'TENANT_ADMIN';
    return this.listProductsUseCase.execute({
      tenantId: this.requireTenantId(),
      includeCost,
    });
  }

  @ApiOperation({ summary: 'Alertas de stock minimo (TENANT_ADMIN)' })
  @Get('low-stock')
  @Roles('TENANT_ADMIN')
  lowStock() {
    return this.getLowStockAlertsUseCase.execute(this.requireTenantId());
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
