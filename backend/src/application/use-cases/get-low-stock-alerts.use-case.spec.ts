import { GetLowStockAlertsUseCase } from './get-low-stock-alerts.use-case';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { Product } from '../../domain/entities/product.entity';

describe('GetLowStockAlertsUseCase', () => {
  let useCase: GetLowStockAlertsUseCase;
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
  const categoryRepository: jest.Mocked<ICategoryRepository> = {
    findById: jest.fn(),
    findByName: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };

  const tenantId = 'tenant-1';

  const buildProduct = (partial: Partial<Product> = {}): Product => {
    const base = new Product(
      'p1',
      tenantId,
      'BEB-001',
      'Coca-Cola 1.5L',
      null,
      2.5,
      1.8,
      2,
      5,
      null,
      true,
      new Date(),
      new Date(),
    );
    return Object.assign(base, partial);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetLowStockAlertsUseCase(
      productRepository,
      categoryRepository,
    );
  });

  it('retorna solo los productos con stock menor o igual al minimo', async () => {
    productRepository.listLowStock.mockResolvedValue([
      buildProduct({ id: 'p1', stock: 2 }),
      buildProduct({ id: 'p2', stock: 5 }),
    ]);
    categoryRepository.listByTenant.mockResolvedValue([]);

    const result = await useCase.execute(tenantId);

    expect(result.count).toBe(2);
    expect(result.products.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(productRepository.listLowStock).toHaveBeenCalledWith(tenantId);
  });

  it('retorna count 0 si no hay alertas', async () => {
    productRepository.listLowStock.mockResolvedValue([]);

    const result = await useCase.execute(tenantId);

    expect(result.count).toBe(0);
    expect(result.products).toEqual([]);
  });
});
