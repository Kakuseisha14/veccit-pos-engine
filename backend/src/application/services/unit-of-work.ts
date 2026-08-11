import type { IProductRepository } from '../../domain/repositories/product.repository';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';

export interface ITransactionUnit {
  productRepository: IProductRepository;
  saleRepository: ISaleRepository;
}

export interface IUnitOfWork {
  runInTransaction<T>(work: (unit: ITransactionUnit) => Promise<T>): Promise<T>;
}

export const UNIT_OF_WORK = Symbol('IUnitOfWork');
