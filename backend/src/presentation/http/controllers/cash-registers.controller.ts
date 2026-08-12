import {
  Body,
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
import { OpenCashRegisterUseCase } from '../../../application/use-cases/open-cash-register.use-case';
import { CloseCashRegisterUseCase } from '../../../application/use-cases/close-cash-register.use-case';
import { GetShiftSummaryUseCase } from '../../../application/use-cases/get-shift-summary.use-case';
import { ListCashRegistersUseCase } from '../../../application/use-cases/list-cash-registers.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { OpenCashRegisterRequestDto } from '../../dtos/open-cash-register.request';
import { CloseCashRegisterRequestDto } from '../../dtos/close-cash-register.request';
import { JwtAuthGuard, AuthenticatedRequest } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';
import { ShiftNotFoundException } from '../../../domain/exceptions/shift-not-found.exception';
import { ShiftAlreadyOpenException } from '../../../domain/exceptions/shift-already-open.exception';
import { ShiftAlreadyClosedException } from '../../../domain/exceptions/shift-already-closed.exception';
import { ConflictException } from '@nestjs/common';

@ApiTags('Cash Registers')
@ApiCookieAuth()
@Controller('cash-registers')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class CashRegistersController {
  constructor(
    private readonly openCashRegisterUseCase: OpenCashRegisterUseCase,
    private readonly closeCashRegisterUseCase: CloseCashRegisterUseCase,
    private readonly getShiftSummaryUseCase: GetShiftSummaryUseCase,
    private readonly listCashRegistersUseCase: ListCashRegistersUseCase,
  ) {}

  @ApiOperation({
    summary: 'Abrir turno de caja (TENANT_ADMIN / CASHIER)',
  })
  @Post('open')
  @Roles('TENANT_ADMIN', 'CASHIER')
  async open(
    @Body() dto: OpenCashRegisterRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    try {
      return await this.openCashRegisterUseCase.execute({
        tenantId: this.requireTenantId(),
        cashierId: this.requireUserId(request),
        openingAmountUSD: dto.openingAmountUSD,
      });
    } catch (error) {
      if (error instanceof ShiftAlreadyOpenException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Cerrar turno de caja con arqueo (TENANT_ADMIN / CASHIER)',
  })
  @Post(':id/close')
  @Roles('TENANT_ADMIN', 'CASHIER')
  async close(
    @Param('id') id: string,
    @Body() dto: CloseCashRegisterRequestDto,
  ) {
    try {
      return await this.closeCashRegisterUseCase.execute({
        tenantId: this.requireTenantId(),
        shiftId: id,
        closingAmountUSD: dto.closingAmountUSD,
        notes: dto.notes,
      });
    } catch (error) {
      if (error instanceof ShiftNotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ShiftAlreadyClosedException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Resumen del turno de caja (TENANT_ADMIN / CASHIER)',
  })
  @Get(':id/summary')
  @Roles('TENANT_ADMIN', 'CASHIER')
  async summary(@Param('id') id: string) {
    try {
      return await this.getShiftSummaryUseCase.execute({
        tenantId: this.requireTenantId(),
        shiftId: id,
      });
    } catch (error) {
      if (error instanceof ShiftNotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Historial de turnos de caja (TENANT_ADMIN / CASHIER)',
  })
  @Get()
  @Roles('TENANT_ADMIN', 'CASHIER')
  list() {
    return this.listCashRegistersUseCase.execute({
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

  private requireUserId(request: AuthenticatedRequest): string {
    const userId = request.user?.sub;
    if (!userId) {
      throw new ForbiddenException('No se pudo identificar al usuario');
    }
    return userId;
  }
}
