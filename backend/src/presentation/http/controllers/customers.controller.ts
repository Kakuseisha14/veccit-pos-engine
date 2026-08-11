import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuickRegisterCustomerUseCase } from '../../../application/use-cases/quick-register-customer.use-case';
import { ListCustomersUseCase } from '../../../application/use-cases/list-customers.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { QuickRegisterCustomerRequestDto } from '../../dtos/quick-register-customer.request';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';

@ApiTags('Customers')
@ApiCookieAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class CustomersController {
  constructor(
    private readonly quickRegisterCustomerUseCase: QuickRegisterCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
  ) {}

  @ApiOperation({
    summary: 'Registrar cliente rapido (TENANT_ADMIN / CASHIER)',
  })
  @Post()
  @Roles('TENANT_ADMIN', 'CASHIER')
  register(@Body() dto: QuickRegisterCustomerRequestDto) {
    return this.quickRegisterCustomerUseCase.execute({
      tenantId: this.requireTenantId(),
      ...dto,
    });
  }

  @ApiOperation({
    summary: 'Listar clientes del inquilino (TENANT_ADMIN / CASHIER)',
  })
  @Get()
  @Roles('TENANT_ADMIN', 'CASHIER')
  list() {
    return this.listCustomersUseCase.execute({
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
