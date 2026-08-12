import { ListSalesUseCase } from './list-sales.use-case';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';
import { Sale } from '../../domain/entities/sale.entity';

describe('ListSalesUseCase', () => {
  let useCase: ListSalesUseCase;
  const saleRepository: jest.Mocked<ISaleRepository> = {
    findById: jest.fn(),
    findByTenantAndId: jest.fn(),
    listByTenant: jest.fn(),
    listCompletedSince: jest.fn(),
    listByShift: jest.fn(),
    nextSaleNumber: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListSalesUseCase(saleRepository);
  });

  it('lista las ventas del tenant con items y pagos', async () => {
    const sale = Sale.create({
      tenantId: 'tenant-1',
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
    saleRepository.listByTenant.mockResolvedValue([sale]);

    const result = await useCase.execute({ tenantId: 'tenant-1' });

    expect(saleRepository.listByTenant).toHaveBeenCalledWith('tenant-1');
    expect(result.sales).toHaveLength(1);
    expect(result.sales[0].saleNumber).toBe('V-0001');
    expect(result.sales[0].totalUSD).toBe(5);
    expect(result.sales[0].items).toHaveLength(1);
    expect(result.sales[0].payments).toHaveLength(1);
  });
});
