import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../services/unit-of-work';
import { UNIT_OF_WORK } from '../services/unit-of-work';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository';
import type { IExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository';
import { EXCHANGE_RATE_REPOSITORY } from '../../domain/repositories/exchange-rate.repository';
import type {
  ProcessSaleInput,
  ProcessSaleOutput,
  SaleItemInput,
} from '../dtos/process-sale.dto';
import type { CreateSaleItemInput } from '../../domain/entities/sale-item.entity';
import { Sale } from '../../domain/entities/sale.entity';
import { toSaleOutput } from '../dtos/sale-output.builder';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { ExchangeRateNotSetException } from '../../domain/exceptions/exchange-rate-not-set.exception';

@Injectable()
export class ProcessSaleUseCase {
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(EXCHANGE_RATE_REPOSITORY)
    private readonly exchangeRateRepository: IExchangeRateRepository,
  ) {}

  async execute(input: ProcessSaleInput): Promise<ProcessSaleOutput> {
    if (input.customerId) {
      const customer = await this.customerRepository.findByTenantAndId(
        input.tenantId,
        input.customerId,
      );
      if (!customer) {
        throw new CustomerNotFoundException(input.customerId);
      }
    }

    const activeRate = await this.resolveActiveRate(input.tenantId);
    if (activeRate === null) {
      throw new ExchangeRateNotSetException();
    }

    const payments = input.payments.map((payment) => ({
      ...payment,
      exchangeRateVES: activeRate,
    }));

    return this.unitOfWork.runInTransaction(async (unit) => {
      const itemInputs: CreateSaleItemInput[] = [];
      for (const item of input.items) {
        const product = await unit.productRepository.findByTenantAndId(
          input.tenantId,
          item.productId,
        );
        if (
          !product ||
          !product.isActive ||
          product.tenantId !== input.tenantId
        ) {
          throw new ProductNotFoundException(item.productId);
        }
        itemInputs.push(this.toSaleItemInput(item, product));
      }

      const saleNumber = await unit.saleRepository.nextSaleNumber(
        input.tenantId,
      );

      const sale = Sale.create({
        tenantId: input.tenantId,
        saleNumber,
        customerId: input.customerId ?? null,
        userId: input.userId,
        items: itemInputs,
        payments,
        exchangeRateVES: activeRate,
        taxUSD: input.taxUSD ?? 0,
      });

      for (const saleItem of sale.items) {
        await unit.productRepository.decreaseStock(
          input.tenantId,
          saleItem.productId,
          saleItem.quantity,
        );
      }

      await unit.saleRepository.save(sale);

      return { sale: toSaleOutput(sale) };
    });
  }

  private toSaleItemInput(
    item: SaleItemInput,
    product: {
      id: string;
      name: string;
      sku: string;
      priceUSD: number;
    },
  ): CreateSaleItemInput {
    return {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: item.quantity,
      unitPriceUSD: product.priceUSD,
    };
  }

  private async resolveActiveRate(tenantId: string): Promise<number | null> {
    const today = new Date().toISOString().slice(0, 10);
    const todayRate = await this.exchangeRateRepository.findByTenantAndDate(
      tenantId,
      today,
    );
    if (todayRate) {
      return todayRate.rateVES;
    }
    const latest =
      await this.exchangeRateRepository.findLatestByTenant(tenantId);
    return latest ? latest.rateVES : null;
  }
}
