import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ICashRegisterRepository } from '../../domain/repositories/cash-register.repository';
import type { CashRegister } from '../../domain/entities/cash-register.entity';
import { CashRegisterEntity } from '../persistence/entities/cash-register.entity';
import {
  toDomainCashRegister,
  toEntityCashRegister,
} from '../persistence/mappers/cash-register.mapper';

@Injectable()
export class TypeOrmCashRegisterRepository implements ICashRegisterRepository {
  constructor(
    @InjectRepository(CashRegisterEntity)
    private readonly repository: Repository<CashRegisterEntity>,
  ) {}

  async findOpenByTenantAndCashier(
    tenantId: string,
    cashierId: string,
  ): Promise<CashRegister | null> {
    const entity = await this.repository.findOneBy({
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
    const entity = await this.repository.findOneBy({ tenantId, id });
    return entity ? toDomainCashRegister(entity) : null;
  }

  async listByTenant(tenantId: string): Promise<CashRegister[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { openedAt: 'DESC' },
    });
    return entities.map(toDomainCashRegister);
  }

  async save(shift: CashRegister): Promise<CashRegister> {
    await this.repository.save(toEntityCashRegister(shift));
    return shift;
  }
}
