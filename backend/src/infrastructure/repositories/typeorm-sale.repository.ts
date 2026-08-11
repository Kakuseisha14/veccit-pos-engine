import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';
import type { Sale } from '../../domain/entities/sale.entity';
import { SaleEntity } from '../persistence/entities/sale.entity';
import { SaleItemEntity } from '../persistence/entities/sale-item.entity';
import { SalePaymentEntity } from '../persistence/entities/sale-payment.entity';
import {
  toDomainSale,
  toEntitySale,
  toEntitySaleItems,
  toEntitySalePayments,
} from '../persistence/mappers/sale.mapper';

@Injectable()
export class TypeOrmSaleRepository implements ISaleRepository {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly repository: Repository<SaleEntity>,
    @InjectRepository(SaleItemEntity)
    private readonly itemsRepository: Repository<SaleItemEntity>,
    @InjectRepository(SalePaymentEntity)
    private readonly paymentsRepository: Repository<SalePaymentEntity>,
  ) {}

  async findById(id: string): Promise<Sale | null> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) {
      return null;
    }
    return this.assemble(entity.id, entity);
  }

  async findByTenantAndId(tenantId: string, id: string): Promise<Sale | null> {
    const entity = await this.repository.findOneBy({ tenantId, id });
    if (!entity) {
      return null;
    }
    return this.assemble(entity.id, entity);
  }

  async listByTenant(tenantId: string): Promise<Sale[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(
      entities.map((entity) => this.assemble(entity.id, entity)),
    );
  }

  async nextSaleNumber(tenantId: string): Promise<string> {
    const count = await this.repository.countBy({ tenantId });
    return `V-${String(count + 1).padStart(4, '0')}`;
  }

  async save(sale: Sale): Promise<Sale> {
    await this.repository.save(toEntitySale(sale));
    if (sale.items.length > 0) {
      await this.itemsRepository.save(toEntitySaleItems(sale));
    }
    if (sale.payments.length > 0) {
      await this.paymentsRepository.save(toEntitySalePayments(sale));
    }
    return sale;
  }

  private async assemble(saleId: string, entity: SaleEntity): Promise<Sale> {
    const [items, payments] = await Promise.all([
      this.itemsRepository.find({
        where: { saleId: In([saleId]) },
        order: { createdAt: 'ASC' },
      }),
      this.paymentsRepository.find({
        where: { saleId: In([saleId]) },
        order: { createdAt: 'ASC' },
      }),
    ]);
    return toDomainSale(entity, items, payments);
  }
}
