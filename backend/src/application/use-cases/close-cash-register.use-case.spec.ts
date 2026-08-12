import { CloseCashRegisterUseCase } from './close-cash-register.use-case';
import type { IUnitOfWork, ITransactionUnit } from '../services/unit-of-work';
import type { ICashRegisterRepository } from '../../domain/repositories/cash-register.repository';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { ShiftSummaryService } from '../services/shift-summary.service';
import { CashRegister } from '../../domain/entities/cash-register.entity';
import { Sale } from '../../domain/entities/sale.entity';
import { ShiftNotFoundException } from '../../domain/exceptions/shift-not-found.exception';

describe('CloseCashRegisterUseCase', () => {
  let useCase: CloseCashRegisterUseCase;
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

  function makeSale(paymentMethod: string, amountUSD: number): Sale {
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
          quantity: 1,
          unitPriceUSD: amountUSD,
        },
      ],
      payments: [
        {
          paymentMethod: paymentMethod as never,
          amount: amountUSD,
          currency: 'USD',
          exchangeRateVES: 60,
        },
      ],
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CloseCashRegisterUseCase(
      unitOfWork,
      new ShiftSummaryService(),
    );
    unitOfWork.runInTransaction.mockImplementation(async (work) => work(unit));
    const openShift = CashRegister.open({
      tenantId,
      cashierId: 'user-1',
      openingAmountUSD: 50,
    });
    cashRegisterRepository.findByTenantAndId.mockResolvedValue(openShift);
  });

  it('cierra el turno calculando el efectivo esperado desde las ventas del turno', async () => {
    const shift = await cashRegisterRepository.findByTenantAndId(tenantId, 's');
    saleRepository.listByShift.mockResolvedValue([
      makeSale('CASH_USD', 5),
      makeSale('PAGO_MOVIL_VES', 5),
    ]);
    cashRegisterRepository.save.mockImplementation(async (s) => s);

    const result = await useCase.execute({
      tenantId,
      shiftId: shift!.id,
      closingAmountUSD: 55.5,
      notes: 'Cierre',
    });

    expect(result.shift.status).toBe('CLOSED');
    expect(result.shift.expectedCashUSD).toBe(5);
    expect(result.shift.closingAmountUSD).toBe(55.5);
    expect(result.shift.differenceUSD).toBe(50.5);
    expect(saleRepository.listByShift).toHaveBeenCalledWith(
      tenantId,
      shift!.id,
    );
  });

  it('lanza ShiftNotFoundException si el turno no existe o es de otro tenant', async () => {
    cashRegisterRepository.findByTenantAndId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tenantId,
        shiftId: 'shift-x',
        closingAmountUSD: 50,
      }),
    ).rejects.toThrow(ShiftNotFoundException);
    expect(cashRegisterRepository.save).not.toHaveBeenCalled();
  });
});
