import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCategoryUseCase } from '../../../application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '../../../application/use-cases/list-categories.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { CreateCategoryRequestDto } from '../../dtos/create-category.request';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';

@ApiTags('Categories')
@ApiCookieAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear una categoria de productos' })
  @Post()
  @Roles('TENANT_ADMIN')
  create(@Body() dto: CreateCategoryRequestDto) {
    return this.createCategoryUseCase.execute({
      tenantId: this.requireTenantId(),
      name: dto.name,
    });
  }

  @ApiOperation({ summary: 'Listar categorias del tenant' })
  @Get()
  @Roles('TENANT_ADMIN', 'CASHIER')
  list() {
    return this.listCategoriesUseCase.execute(this.requireTenantId());
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
