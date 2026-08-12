import { Inject, Injectable } from '@nestjs/common';
import type { ShiftSummaryOutput } from '../dtos/shift-summary.dto';
import { toCashRegisterOutput } from '../dtos/cash-register-output.builder';
import { toSaleOutput } from '../dtos/sale-output.builder';
import type { IUnitOfWork } from '../services/unit-of-work';
import { UNIT_OF_WORK } from '../services/unit-of-work';
import { ShiftSummaryService } from '../services/shift-summary.service';
import { ShiftNotFoundException } from '../../domain/exceptions/shift-not-found.exception';

export interface GetShiftSummaryInput {
  tenantId: string;
  shiftId: string;
}

@Injectable()
export class GetShiftSummaryUseCase {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly shiftSummaryService: ShiftSummaryService,
  ) {}

  async execute(input: GetShiftSummaryInput): Promise<ShiftSummaryOutput> {
    return this.unitOfWork.runInTransaction(async (unit) => {
      const shift = await unit.cashRegisterRepository.findByTenantAndId(
        input.tenantId,
        input.shiftId,
      );
      if (!shift) {
        throw new ShiftNotFoundException(input.shiftId);
      }

      const sales = await unit.saleRepository.listByShift(
        input.tenantId,
        input.shiftId,
      );
      const totals = this.shiftSummaryService.build(sales);

      return {
        shift: toCashRegisterOutput(shift),
        salesCount: totals.salesCount,
        voidedSalesCount: totals.voidedSalesCount,
        totalSalesUSD: totals.totalSalesUSD,
        totalVoidedUSD: totals.totalVoidedUSD,
        expectedCashUSD: totals.expectedCashUSD,
        payments: totals.payments,
        sales: sales.map(toSaleOutput),
      };
    });
  }
}
