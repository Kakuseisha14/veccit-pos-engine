import { DataSource } from 'typeorm';
import { TypeOrmUnitOfWork } from './typeorm-unit-of-work';

describe('TypeOrmUnitOfWork', () => {
  let unitOfWork: TypeOrmUnitOfWork;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: unknown;
  };

  beforeEach(() => {
    queryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {},
    };
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as jest.Mocked<DataSource>;
    unitOfWork = new TypeOrmUnitOfWork(dataSource);
  });

  it('hace commit y libera el query runner al terminar el trabajo', async () => {
    const work = jest.fn().mockResolvedValue('ok');

    const result = await unitOfWork.runInTransaction(work);

    expect(result).toBe('ok');
    expect(queryRunner.connect).toHaveBeenCalledTimes(1);
    expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
    expect(work).toHaveBeenCalledTimes(1);
  });

  it('provee repositorios transaccionales (producto y venta) al trabajo', async () => {
    let receivedUnit: unknown;
    await unitOfWork.runInTransaction((unit) => {
      receivedUnit = unit;
      return Promise.resolve();
    });

    const unit = receivedUnit as {
      productRepository: unknown;
      saleRepository: unknown;
    };
    expect(unit).toBeDefined();
    expect(unit.productRepository).toBeDefined();
    expect(unit.saleRepository).toBeDefined();
  });

  it('hace rollback automatico y no hace commit si el trabajo lanza un error', async () => {
    const error = new Error('Fallo forzado en la transaccion');
    const work = jest.fn().mockRejectedValue(error);

    await expect(unitOfWork.runInTransaction(work)).rejects.toThrow(error);

    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('propaga el error original al llamador', async () => {
    const error = new Error('Pago rechazado');
    await expect(
      unitOfWork.runInTransaction(() => Promise.reject(error)),
    ).rejects.toBe(error);
  });
});
