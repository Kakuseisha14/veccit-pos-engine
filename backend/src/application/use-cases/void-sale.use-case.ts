import { Inject, Injectable } from '@nestjs/common';
import type { VoidSaleInput, VoidSaleOutput } from '../dtos/void-sale.dto';
import { toSaleOutput } from '../dtos/sale-output.builder';
import type { IUnitOfWork } from '../services/unit-of-work';
import { UNIT_OF_WORK } from '../services/unit-of-work';
import { SaleNotFoundException } from '../../domain/exceptions/sale-not-found.exception';

@Injectable()
export class VoidSaleUseCase {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(input: VoidSaleInput): Promise<VoidSaleOutput> {
    return this.unitOfWork.runInTransaction(async (unit) => {
      const sale = await unit.saleRepository.findByTenantAndId(
        input.tenantId,
        input.saleId,
      );
      if (!sale) {
        throw new SaleNotFoundException(input.saleId);
      }

      const voidedSale = sale.void({
        voidedByUserId: input.voidedByUserId,
        reason: input.reason,
      });

      for (const item of voidedSale.items) {
        await unit.productRepository.increaseStock(
          input.tenantId,
          item.productId,
          item.quantity,
        );
      }

      await unit.saleRepository.save(voidedSale);

      return { sale: toSaleOutput(voidedSale) };
    });
  }
}
