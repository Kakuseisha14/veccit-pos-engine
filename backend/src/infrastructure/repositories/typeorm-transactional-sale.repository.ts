import { EntityManager, In } from 'typeorm';
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

export class TypeOrmTransactionalSaleRepository implements ISaleRepository {
  constructor(private readonly manager: EntityManager) {}

  async findById(id: string): Promise<Sale | null> {
    const entity = await this.manager.findOneBy(SaleEntity, { id });
    if (!entity) {
      return null;
    }
    return this.assemble(entity.id, entity);
  }

  async findByTenantAndId(tenantId: string, id: string): Promise<Sale | null> {
    const entity = await this.manager.findOneBy(SaleEntity, { tenantId, id });
    if (!entity) {
      return null;
    }
    return this.assemble(entity.id, entity);
  }

  async listByTenant(tenantId: string): Promise<Sale[]> {
    const entities = await this.manager.find(SaleEntity, {
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return Promise.all(
      entities.map((entity) => this.assemble(entity.id, entity)),
    );
  }

  async nextSaleNumber(tenantId: string): Promise<string> {
    const count = await this.manager.count(SaleEntity, {
      where: { tenantId },
    });
    return `V-${String(count + 1).padStart(4, '0')}`;
  }

  async save(sale: Sale): Promise<Sale> {
    await this.manager.save(toEntitySale(sale));
    if (sale.items.length > 0) {
      await this.manager.save(toEntitySaleItems(sale));
    }
    if (sale.payments.length > 0) {
      await this.manager.save(toEntitySalePayments(sale));
    }
    return sale;
  }

  private async assemble(saleId: string, entity: SaleEntity): Promise<Sale> {
    const [items, payments] = await Promise.all([
      this.manager.find(SaleItemEntity, {
        where: { saleId: In([saleId]) },
        order: { createdAt: 'ASC' },
      }),
      this.manager.find(SalePaymentEntity, {
        where: { saleId: In([saleId]) },
        order: { createdAt: 'ASC' },
      }),
    ]);
    return toDomainSale(entity, items, payments);
  }
}
