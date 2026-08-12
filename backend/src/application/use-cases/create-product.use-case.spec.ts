import { CreateProductUseCase } from './create-product.use-case';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { Product } from '../../domain/entities/product.entity';
import { SkuAlreadyExistsException } from '../../domain/exceptions/sku-already-exists.exception';
import { CategoryNotFoundException } from '../../domain/exceptions/category-not-found.exception';
import { InvalidProductDataException } from '../../domain/exceptions/invalid-product-data.exception';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
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

  const validInput = {
    tenantId,
    sku: '  beb-001 ',
    name: 'Coca-Cola 1.5L',
    priceUSD: 2.5,
    costUSD: 1.8,
    stock: 10,
    minStock: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateProductUseCase(productRepository, categoryRepository);
  });

  it('crea un producto normalizando el SKU a mayusculas', async () => {
    productRepository.findBySku.mockResolvedValue(null);

    const result = await useCase.execute(validInput);

    expect(productRepository.save).toHaveBeenCalledTimes(1);
    expect(result.product.sku).toBe('BEB-001');
    expect(result.product.priceUSD).toBe(2.5);
    expect(result.product.stock).toBe(10);
  });

  it('lanza SkuAlreadyExistsException si el SKU ya existe en el tenant', async () => {
    const existing = new Product(
      'p1',
      tenantId,
      'BEB-001',
      'Otro',
      null,
      1,
      0,
      0,
      0,
      null,
      true,
      new Date(),
      new Date(),
    );
    productRepository.findBySku.mockResolvedValue(existing);

    await expect(useCase.execute(validInput)).rejects.toThrow(
      SkuAlreadyExistsException,
    );
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it('lanza CategoryNotFoundException si la categoria no existe en el tenant', async () => {
    productRepository.findBySku.mockResolvedValue(null);
    categoryRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ ...validInput, categoryId: 'cat-1' }),
    ).rejects.toThrow(CategoryNotFoundException);
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it('lanza InvalidProductDataException si el precio es negativo', async () => {
    productRepository.findBySku.mockResolvedValue(null);

    await expect(
      useCase.execute({ ...validInput, priceUSD: -5 }),
    ).rejects.toThrow(InvalidProductDataException);
    expect(productRepository.save).not.toHaveBeenCalled();
  });
});
