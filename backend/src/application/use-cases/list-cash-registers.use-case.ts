import { Inject, Injectable } from '@nestjs/common';
import type {
  ListCashRegistersInput,
  ListCashRegistersOutput,
} from '../dtos/list-cash-registers.dto';
import { toCashRegisterOutput } from '../dtos/cash-register-output.builder';
import type { ICashRegisterRepository } from '../../domain/repositories/cash-register.repository';
import { CASH_REGISTER_REPOSITORY } from '../../domain/repositories/cash-register.repository';

@Injectable()
export class ListCashRegistersUseCase {
  constructor(
    @Inject(CASH_REGISTER_REPOSITORY)
    private readonly cashRegisterRepository: ICashRegisterRepository,
  ) {}

  async execute(
    input: ListCashRegistersInput,
  ): Promise<ListCashRegistersOutput> {
    const shifts = await this.cashRegisterRepository.listByTenant(
      input.tenantId,
    );
    return { shifts: shifts.map(toCashRegisterOutput) };
  }
}
