import { VoidSaleUseCase } from './void-sale.use-case';
import type { IUnitOfWork, ITransactionUnit } from '../services/unit-of-work';
import type { ICashRegisterRepository } from '../../domain/repositories/cash-register.repository';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleNotFoundException } from '../../domain/exceptions/sale-not-found.exception';
import { SaleAlreadyVoidedException } from '../../domain/exceptions/sale-already-voided.exception';

describe('VoidSaleUseCase', () => {
  let useCase: VoidSaleUseCase;
  const unitOfWork: jest.Mocked<IUnitOfWork> = {
    runInTransaction: jest.fn(),
  };
  const cashRegisterRepository: jest.Mocked<ICashRegisterRepository> = {
    findOpenByTenantAndCashier: jest.fn(),
    findByTenantAndId: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };
  const saleRepository: jest.Mocked<ISaleRepository> = {
    findById: jest.fn(),
    findByTenantAndId: jest.fn(),
    listByTenant: jest.fn(),
    listByShift: jest.fn(),
    nextSaleNumber: jest.fn(),
    save: jest.fn(),
  };
  const productRepository: jest.Mocked<IProductRepository> = {
    findById: jest.fn(),
    findByTenantAndId: jest.fn(),
    findBySku: jest.fn(),
    listByTenant: jest.fn(),
    listLowStock: jest.fn(),
    save: jest.fn(),
    decreaseStock: jest.fn(),
    increaseStock: jest.fn(),
  };
  const unit: ITransactionUnit = {
    productRepository,
    saleRepository,
    cashRegisterRepository,
  };

  const tenantId = 'tenant-1';

  function makeSale(): Sale {
    return Sale.create({
      tenantId,
      saleNumber: 'V-0001',
      customerId: null,
      userId: 'user-1',
      exchangeRateVES: 60,
      items: [
        {
          productId: 'p1',
          productName: 'Coca-Cola 1.5L',
          productSku: 'BEB-001',
          quantity: 2,
          unitPriceUSD: 2.5,
        },
      ],
      payments: [
        {
          paymentMethod: 'CASH_USD',
          amount: 5,
          currency: 'USD',
          exchangeRateVES: 60,
        },
      ],
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new VoidSaleUseCase(unitOfWork);
    unitOfWork.runInTransaction.mockImplementation(async (work) => work(unit));
    saleRepository.save.mockImplementation(async (sale) => sale);
    productRepository.increaseStock.mockResolvedValue();
  });

  it('anula la venta y repone el stock de cada item', async () => {
    const sale = makeSale();
    saleRepository.findByTenantAndId.mockResolvedValue(sale);

    const result = await useCase.execute({
      tenantId,
      saleId: sale.id,
      voidedByUserId: 'admin-1',
      reason: 'Error de caja',
    });

    expect(result.sale.status).toBe('VOIDED');
    expect(result.sale.voidedByUserId).toBe('admin-1');
    expect(productRepository.increaseStock).toHaveBeenCalledWith(
      tenantId,
      'p1',
      2,
    );
    expect(saleRepository.save).toHaveBeenCalledTimes(1);
  });

  it('lanza SaleNotFoundException si la venta no existe o es de otro tenant', async () => {
    saleRepository.findByTenantAndId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tenantId,
        saleId: 'sale-x',
        voidedByUserId: 'admin-1',
      }),
    ).rejects.toThrow(SaleNotFoundException);
    expect(productRepository.increaseStock).not.toHaveBeenCalled();
  });

  it('lanza SaleAlreadyVoidedException si la venta ya fue anulada', async () => {
    const sale = makeSale().void({ voidedByUserId: 'admin-1' });
    saleRepository.findByTenantAndId.mockResolvedValue(sale);

    await expect(
      useCase.execute({ tenantId, saleId: sale.id, voidedByUserId: 'admin-1' }),
    ).rejects.toThrow(SaleAlreadyVoidedException);
    expect(productRepository.increaseStock).not.toHaveBeenCalled();
  });
});
