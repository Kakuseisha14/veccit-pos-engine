import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IStockAdjustmentRepository } from '../../domain/repositories/stock-adjustment.repository';
import type { StockAdjustment } from '../../domain/entities/stock-adjustment.entity';
import { StockAdjustmentEntity } from '../persistence/entities/stock-adjustment.entity';
import {
  toDomainStockAdjustment,
  toEntityStockAdjustment,
} from '../persistence/mappers/stock-adjustment.mapper';

@Injectable()
export class TypeOrmStockAdjustmentRepository implements IStockAdjustmentRepository {
  constructor(
    @InjectRepository(StockAdjustmentEntity)
    private readonly repository: Repository<StockAdjustmentEntity>,
  ) {}

  async listByTenant(tenantId: string): Promise<StockAdjustment[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(toDomainStockAdjustment);
  }

  async save(adjustment: StockAdjustment): Promise<StockAdjustment> {
    await this.repository.save(toEntityStockAdjustment(adjustment));
    return adjustment;
  }
}
