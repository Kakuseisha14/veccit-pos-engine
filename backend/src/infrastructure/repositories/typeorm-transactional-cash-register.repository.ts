import { EntityManager } from 'typeorm';
import type { ICashRegisterRepository } from '../../domain/repositories/cash-register.repository';
import type { CashRegister } from '../../domain/entities/cash-register.entity';
import { CashRegisterEntity } from '../persistence/entities/cash-register.entity';
import {
  toDomainCashRegister,
  toEntityCashRegister,
} from '../persistence/mappers/cash-register.mapper';

export class TypeOrmTransactionalCashRegisterRepository implements ICashRegisterRepository {
  constructor(private readonly manager: EntityManager) {}

  async findOpenByTenantAndCashier(
    tenantId: string,
    cashierId: string,
  ): Promise<CashRegister | null> {
    const entity = await this.manager.findOneBy(CashRegisterEntity, {
      tenantId,
      cashierId,
      status: 'OPEN',
    });
    return entity ? toDomainCashRegister(entity) : null;
  }

  async findByTenantAndId(
    tenantId: string,
    id: string,
  ): Promise<CashRegister | null> {
    const entity = await this.manager.findOneBy(CashRegisterEntity, {
      tenantId,
      id,
    });
    return entity ? toDomainCashRegister(entity) : null;
  }

  async listByTenant(tenantId: string): Promise<CashRegister[]> {
    const entities = await this.manager.find(CashRegisterEntity, {
      where: { tenantId },
      order: { openedAt: 'DESC' },
    });
    return entities.map(toDomainCashRegister);
  }

  async save(shift: CashRegister): Promise<CashRegister> {
    await this.manager.save(toEntityCashRegister(shift));
    return shift;
  }
}
