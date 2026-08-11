import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type {
  ITransactionUnit,
  IUnitOfWork,
} from '../../application/services/unit-of-work';
import { TypeOrmTransactionalProductRepository } from './typeorm-transactional-product.repository';
import { TypeOrmTransactionalSaleRepository } from './typeorm-transactional-sale.repository';

@Injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  constructor(private readonly dataSource: DataSource) {}

  async runInTransaction<T>(
    work: (unit: ITransactionUnit) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const unit: ITransactionUnit = {
        productRepository: new TypeOrmTransactionalProductRepository(
          queryRunner.manager,
        ),
        saleRepository: new TypeOrmTransactionalSaleRepository(
          queryRunner.manager,
        ),
      };
      const result = await work(unit);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
