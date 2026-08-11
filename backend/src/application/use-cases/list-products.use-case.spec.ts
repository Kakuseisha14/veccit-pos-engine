import { ListProductsUseCase } from './list-products.use-case';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { Product } from '../../domain/entities/product.entity';
import { Category } from '../../domain/entities/category.entity';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  const productRepository: jest.Mocked<IProductRepository> = {
    findById: jest.fn(),
    findByTenantAndId: jest.fn(),
    findBySku: jest.fn(),
    listByTenant: jest.fn(),
    listLowStock: jest.fn(),
    save: jest.fn(),
    decreaseStock: jest.fn(),
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
      'Bebidas',
      null,
      2.5,
      1.8,
      10,
      5,
      'cat-1',
      true,
      new Date(),
      new Date(),
    );
    return Object.assign(base, partial);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListProductsUseCase(productRepository, categoryRepository);
  });

  it('retorna productos ordenados con nombre de categoria', async () => {
    productRepository.listByTenant.mockResolvedValue([
      buildProduct({ name: 'Zumo', categoryId: 'cat-1' }),
      buildProduct({ id: 'p2', name: 'Agua', categoryId: 'cat-1' }),
    ]);
    const categories: Category[] = [
      new Category('cat-1', tenantId, 'Bebidas', new Date(), new Date(), true),
    ];
    categoryRepository.listByTenant.mockResolvedValue(categories);

    const result = await useCase.execute({ tenantId, includeCost: true });

    expect(result.products.map((p) => p.name)).toEqual(['Agua', 'Zumo']);
    expect(result.products[0].categoryName).toBe('Bebidas');
    expect(result.products[0].costUSD).toBe(1.8);
  });

  it('oculta el costo cuando includeCost es false (CASHIER)', async () => {
    productRepository.listByTenant.mockResolvedValue([buildProduct()]);
    categoryRepository.listByTenant.mockResolvedValue([]);

    const result = await useCase.execute({ tenantId, includeCost: false });

    expect(result.products[0].costUSD).toBe(0);
  });
});
