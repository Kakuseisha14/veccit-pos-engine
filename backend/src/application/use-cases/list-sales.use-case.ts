import { Inject, Injectable } from '@nestjs/common';
import type { ListSalesInput, ListSalesOutput } from '../dtos/list-sales.dto';
import { toSaleOutput } from '../dtos/sale-output.builder';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository';

@Injectable()
export class ListSalesUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: ISaleRepository,
  ) {}

  async execute(input: ListSalesInput): Promise<ListSalesOutput> {
    const sales = await this.saleRepository.listByTenant(input.tenantId);
    return { sales: sales.map(toSaleOutput) };
  }
}
