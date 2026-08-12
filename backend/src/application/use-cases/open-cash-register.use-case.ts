import { Inject, Injectable } from '@nestjs/common';
import type {
  OpenCashRegisterInput,
  OpenCashRegisterOutput,
} from '../dtos/open-cash-register.dto';
import { toCashRegisterOutput } from '../dtos/cash-register-output.builder';
import { CashRegister } from '../../domain/entities/cash-register.entity';
import type { ICashRegisterRepository } from '../../domain/repositories/cash-register.repository';
import { CASH_REGISTER_REPOSITORY } from '../../domain/repositories/cash-register.repository';
import { ShiftAlreadyOpenException } from '../../domain/exceptions/shift-already-open.exception';

@Injectable()
export class OpenCashRegisterUseCase {
  constructor(
    @Inject(CASH_REGISTER_REPOSITORY)
    private readonly cashRegisterRepository: ICashRegisterRepository,
  ) {}

  async execute(input: OpenCashRegisterInput): Promise<OpenCashRegisterOutput> {
    const existing =
      await this.cashRegisterRepository.findOpenByTenantAndCashier(
        input.tenantId,
        input.cashierId,
      );
    if (existing) {
      throw new ShiftAlreadyOpenException();
    }

    const shift = CashRegister.open({
      tenantId: input.tenantId,
      cashierId: input.cashierId,
      openingAmountUSD: input.openingAmountUSD,
    });

    await this.cashRegisterRepository.save(shift);

    return { shift: toCashRegisterOutput(shift) };
  }
}
