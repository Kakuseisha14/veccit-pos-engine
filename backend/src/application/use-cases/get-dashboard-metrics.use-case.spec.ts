import { GetDashboardMetricsUseCase } from './get-dashboard-metrics.use-case';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleItem } from '../../domain/entities/sale-item.entity';
import { Product } from '../../domain/entities/product.entity';

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function atHour(base: Date, hour: number): Date {
  const copy = new Date(base);
  copy.setHours(hour, 30, 0, 0);
  return copy;
}

function makeItem(
  productId: string,
  productName: string,
  sku: string,
  quantity: number,
  unitPriceUSD: number,
): SaleItem {
  return new SaleItem(
    `item-${productId}`,
    'sale-id',
    productId,
    productName,
    sku,
    quantity,
    unitPriceUSD,
    Number((quantity * unitPriceUSD).toFixed(2)),
  );
}

function makeSale(params: {
  id: string;
  createdAt: Date;
  items: SaleItem[];
  totalUSD: number;
  status?: 'COMPLETED' | 'VOIDED';
}): Sale {
  const status = params.status ?? 'COMPLETED';
  return new Sale(
    params.id,
    'tenant-1',
    `V-${params.id}`,
    null,
    'user-1',
    null,
    params.items,
    [],
    params.totalUSD,
    0,
    params.totalUSD,
    60,
    Number((params.totalUSD * 60).toFixed(2)),
    status,
    params.createdAt,
    status === 'VOIDED' ? params.createdAt : null,
    null,
    null,
  );
}

function makeProduct(
  id: string,
  sku: string,
  name: string,
  costUSD: number,
): Product {
  return new Product(
    id,
    'tenant-1',
    sku,
    name,
    null,
    costUSD + 2,
    costUSD,
    10,
    2,
    null,
    true,
    new Date(),
    new Date(),
  );
}

describe('GetDashboardMetricsUseCase', () => {
  let useCase: GetDashboardMetricsUseCase;
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

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetDashboardMetricsUseCase(saleRepository, productRepository);
  });

  it('calcula métricas de hoy y de los últimos 7 días excluyendo ventas anuladas', async () => {
    const today = startOfDay(new Date());
    const itemA = makeItem('p-a', 'Producto A', 'A-001', 2, 2.5);

    const sales = [
      makeSale({
        id: '1',
        createdAt: atHour(today, 10),
        items: [itemA],
        totalUSD: 5,
      }),
      makeSale({
        id: '2',
        createdAt: atHour(today, 12),
        items: [makeItem('p-b', 'Producto B', 'B-001', 1, 4)],
        totalUSD: 4,
      }),
      makeSale({
        id: '3',
        createdAt: atHour(addDays(today, -1), 15),
        items: [makeItem('p-a', 'Producto A', 'A-001', 10, 2.5)],
        totalUSD: 25,
      }),
    ];
    const voided = makeSale({
      id: 'voided',
      createdAt: atHour(today, 11),
      items: [makeItem('p-a', 'Producto A', 'A-001', 99, 2.5)],
      totalUSD: 999,
      status: 'VOIDED',
    });

    saleRepository.listCompletedSince.mockResolvedValue([...sales, voided]);
    productRepository.listByTenant.mockResolvedValue([
      makeProduct('p-a', 'A-001', 'Producto A', 1),
      makeProduct('p-b', 'B-001', 'Producto B', 2),
    ]);

    const result = await useCase.execute({ tenantId: 'tenant-1' });

    expect(saleRepository.listCompletedSince).toHaveBeenCalledWith(
      'tenant-1',
      startOfDay(addDays(today, -6)),
    );
    expect(result.today.salesCount).toBe(2);
    expect(result.today.salesUSD).toBe(9);
    expect(result.today.grossProfitUSD).toBe(5);

    expect(result.last7Days.salesCount).toBe(3);
    expect(result.last7Days.salesUSD).toBe(34);
    // A: (2.5-1)*2 + (2.5-1)*10 = 3 + 15; B: (4-2)*1 = 2 => 20
    expect(result.last7Days.grossProfitUSD).toBe(20);

    expect(result.bestSellingProduct).toEqual({
      productId: 'p-a',
      productName: 'Producto A',
      productSku: 'A-001',
      quantitySold: 12,
    });
  });

  it('rellena la serie diaria con ceros y en orden cronológico', async () => {
    const today = startOfDay(new Date());
    const item = makeItem('p-a', 'Producto A', 'A-001', 1, 2.5);
    const sales = [
      makeSale({
        id: '1',
        createdAt: atHour(addDays(today, -6), 9),
        items: [item],
        totalUSD: 2.5,
      }),
      makeSale({
        id: '2',
        createdAt: atHour(addDays(today, -3), 9),
        items: [item],
        totalUSD: 2.5,
      }),
    ];
    saleRepository.listCompletedSince.mockResolvedValue(sales);
    productRepository.listByTenant.mockResolvedValue([
      makeProduct('p-a', 'A-001', 'Producto A', 0.5),
    ]);

    const result = await useCase.execute({ tenantId: 'tenant-1' });

    expect(result.dailySales).toHaveLength(7);
    expect(result.dailySales[0]).toEqual({
      date: expect.any(String),
      salesCount: 1,
      salesUSD: 2.5,
    });
    expect(result.dailySales[1].salesCount).toBe(0);
    expect(result.dailySales[2].salesCount).toBe(0);
    expect(result.dailySales[3].salesCount).toBe(1);
    expect(result.dailySales[6]).toMatchObject({ salesCount: 0, salesUSD: 0 });

    const dateKeys = result.dailySales.map((point) => point.date);
    expect(new Set(dateKeys).size).toBe(7);
    expect(dateKeys[6]).toBe(result.dailySales[6].date);
  });

  it('devuelve bestSellingProduct null cuando no hay ventas', async () => {
    saleRepository.listCompletedSince.mockResolvedValue([]);
    productRepository.listByTenant.mockResolvedValue([]);

    const result = await useCase.execute({ tenantId: 'tenant-1' });

    expect(result.today.salesCount).toBe(0);
    expect(result.last7Days.salesUSD).toBe(0);
    expect(result.dailySales).toHaveLength(7);
    expect(result.dailySales.every((point) => point.salesCount === 0)).toBe(
      true,
    );
    expect(result.bestSellingProduct).toBeNull();
  });
});
