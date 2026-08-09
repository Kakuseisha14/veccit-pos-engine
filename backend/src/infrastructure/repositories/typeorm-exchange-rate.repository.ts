import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository';
import type { ExchangeRate } from '../../domain/entities/exchange-rate.entity';
import { ExchangeRateEntity } from '../persistence/entities/exchange-rate.entity';
import {
  toDomainExchangeRate,
  toEntityExchangeRate,
} from '../persistence/mappers/exchange-rate.mapper';

@Injectable()
export class TypeOrmExchangeRateRepository implements IExchangeRateRepository {
  constructor(
    @InjectRepository(ExchangeRateEntity)
    private readonly repository: Repository<ExchangeRateEntity>,
  ) {}

  async findById(id: string): Promise<ExchangeRate | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? toDomainExchangeRate(entity) : null;
  }

  async findByTenantAndDate(
    tenantId: string,
    date: string,
  ): Promise<ExchangeRate | null> {
    const entity = await this.repository.findOneBy({ tenantId, date });
    return entity ? toDomainExchangeRate(entity) : null;
  }

  async findLatestByTenant(tenantId: string): Promise<ExchangeRate | null> {
    const entity = await this.repository.findOne({
      where: { tenantId },
      order: { date: 'DESC' },
    });
    return entity ? toDomainExchangeRate(entity) : null;
  }

  async save(rate: ExchangeRate): Promise<ExchangeRate> {
    await this.repository.save(toEntityExchangeRate(rate));
    return rate;
  }
}
