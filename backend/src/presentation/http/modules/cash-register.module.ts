import { Module } from '@nestjs/common';
import { OpenCashRegisterUseCase } from '../../../application/use-cases/open-cash-register.use-case';
import { CloseCashRegisterUseCase } from '../../../application/use-cases/close-cash-register.use-case';
import { GetShiftSummaryUseCase } from '../../../application/use-cases/get-shift-summary.use-case';
import { ListCashRegistersUseCase } from '../../../application/use-cases/list-cash-registers.use-case';
import { ShiftSummaryService } from '../../../application/services/shift-summary.service';
import { CashRegistersController } from '../controllers/cash-registers.controller';

@Module({
  controllers: [CashRegistersController],
  providers: [
    OpenCashRegisterUseCase,
    CloseCashRegisterUseCase,
    GetShiftSummaryUseCase,
    ListCashRegistersUseCase,
    ShiftSummaryService,
  ],
})
export class CashRegisterModule {}
