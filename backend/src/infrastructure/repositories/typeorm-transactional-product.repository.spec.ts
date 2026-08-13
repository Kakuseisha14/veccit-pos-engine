import { EntityManager } from 'typeorm';
import { TypeOrmTransactionalProductRepository } from './typeorm-transactional-product.repository';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';

describe('TypeOrmTransactionalProductRepository', () => {
  let repository: TypeOrmTransactionalProductRepository;
  let manager: { query: jest.Mock; findOneBy: jest.Mock };

  beforeEach(() => {
    manager = { query: jest.fn(), findOneBy: jest.fn() };
    repository = new TypeOrmTransactionalProductRepository(
      manager as unknown as EntityManager,
    );
  });

  it('descuenta stock cuando el formato de TypeORM devuelve [rows, rowCount]', async () => {
    manager.query.mockResolvedValue([[{ id: 'p1' }], 1]);

    await expect(
      repository.decreaseStock('t1', 'p1', 2),
    ).resolves.not.toThrow();

    expect(manager.query).toHaveBeenCalledTimes(1);
  });

  it('lanza InsufficientStockException aunque el result venga como [rows, rowCount]', async () => {
    manager.query.mockResolvedValue([[], 0]);
    manager.findOneBy.mockResolvedValue({
      id: 'p1',
      tenantId: 't1',
      sku: 'SKU',
      name: 'P',
      stock: 2,
      minStock: 0,
    });

    await expect(repository.decreaseStock('t1', 'p1', 3)).rejects.toThrow(
      InsufficientStockException,
    );
    expect(manager.findOneBy).toHaveBeenCalled();
  });

  it('lanza ProductNotFoundException si el producto no existe (result [rows, rowCount])', async () => {
    manager.query.mockResolvedValue([[], 0]);
    manager.findOneBy.mockResolvedValue(null);

    await expect(repository.decreaseStock('t1', 'p1', 1)).rejects.toThrow(
      ProductNotFoundException,
    );
  });

  it('incrementa stock cuando el formato es [rows, rowCount]', async () => {
    manager.query.mockResolvedValue([[{ id: 'p1' }], 1]);

    await expect(
      repository.increaseStock('t1', 'p1', 5),
    ).resolves.not.toThrow();
    expect(manager.query).toHaveBeenCalledTimes(1);
  });

  it('lanza ProductNotFoundException al incrementar stock inexistente', async () => {
    manager.query.mockResolvedValue([[], 0]);

    await expect(repository.increaseStock('t1', 'p1', 5)).rejects.toThrow(
      ProductNotFoundException,
    );
  });
});
