import { Inject, Injectable } from '@nestjs/common';
import type {
  CloseCashRegisterInput,
  CloseCashRegisterOutput,
} from '../dtos/close-cash-register.dto';
import { toCashRegisterOutput } from '../dtos/cash-register-output.builder';
import type { IUnitOfWork } from '../services/unit-of-work';
import { UNIT_OF_WORK } from '../services/unit-of-work';
import { ShiftSummaryService } from '../services/shift-summary.service';
import { ShiftNotFoundException } from '../../domain/exceptions/shift-not-found.exception';

@Injectable()
export class CloseCashRegisterUseCase {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly shiftSummaryService: ShiftSummaryService,
  ) {}

  async execute(
    input: CloseCashRegisterInput,
  ): Promise<CloseCashRegisterOutput> {
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

      const closedShift = shift.close({
        closingAmountUSD: input.closingAmountUSD,
        expectedCashUSD: totals.expectedCashUSD,
        notes: input.notes,
      });

      await unit.cashRegisterRepository.save(closedShift);

      return { shift: toCashRegisterOutput(closedShift) };
    });
  }
}
