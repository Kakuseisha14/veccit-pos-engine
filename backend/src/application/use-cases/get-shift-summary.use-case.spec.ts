import { GetShiftSummaryUseCase } from './get-shift-summary.use-case';
import type { IUnitOfWork, ITransactionUnit } from '../services/unit-of-work';
import type { ICashRegisterRepository } from '../../domain/repositories/cash-register.repository';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { ShiftSummaryService } from '../services/shift-summary.service';
import { CashRegister } from '../../domain/entities/cash-register.entity';
import { Sale } from '../../domain/entities/sale.entity';
import { ShiftNotFoundException } from '../../domain/exceptions/shift-not-found.exception';

describe('GetShiftSummaryUseCase', () => {
  let useCase: GetShiftSummaryUseCase;
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
    listCompletedSince: jest.fn(),
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

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetShiftSummaryUseCase(unitOfWork, new ShiftSummaryService());
    unitOfWork.runInTransaction.mockImplementation(async (work) => work(unit));
  });

  it('devuelve el resumen agregado del turno con sus ventas', async () => {
    const shift = CashRegister.open({
      tenantId,
      cashierId: 'user-1',
      openingAmountUSD: 50,
    });
    const sale = Sale.create({
      tenantId,
      saleNumber: 'V-0001',
      customerId: null,
      userId: 'user-1',
      shiftId: shift.id,
      exchangeRateVES: 60,
      items: [
        {
          productId: 'p1',
          productName: 'Coca-Cola 1.5L',
          productSku: 'BEB-001',
          quantity: 1,
          unitPriceUSD: 5,
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
    cashRegisterRepository.findByTenantAndId.mockResolvedValue(shift);
    saleRepository.listByShift.mockResolvedValue([sale]);

    const result = await useCase.execute({ tenantId, shiftId: shift.id });

    expect(result.shift.id).toBe(shift.id);
    expect(result.salesCount).toBe(1);
    expect(result.totalSalesUSD).toBe(5);
    expect(result.expectedCashUSD).toBe(5);
    expect(result.sales).toHaveLength(1);
    expect(result.sales[0].saleNumber).toBe('V-0001');
  });

  it('lanza ShiftNotFoundException si el turno no existe', async () => {
    cashRegisterRepository.findByTenantAndId.mockResolvedValue(null);

    await expect(
      useCase.execute({ tenantId, shiftId: 'shift-x' }),
    ).rejects.toThrow(ShiftNotFoundException);
  });
});
