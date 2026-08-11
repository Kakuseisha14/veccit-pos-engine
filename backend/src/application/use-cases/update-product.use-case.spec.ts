import { UpdateProductUseCase } from './update-product.use-case';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import type { ICategoryRepository } from '../../domain/repositories/category.repository';
import { Product } from '../../domain/entities/product.entity';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { SkuAlreadyExistsException } from '../../domain/exceptions/sku-already-exists.exception';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
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
      'Coca-Cola 1.5L',
      null,
      2.5,
      1.8,
      10,
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
    useCase = new UpdateProductUseCase(productRepository, categoryRepository);
  });

  it('actualiza los campos del producto', async () => {
    productRepository.findById.mockResolvedValue(buildProduct());

    const result = await useCase.execute({
      tenantId,
      productId: 'p1',
      name: 'Coca-Cola 2L',
      priceUSD: 3,
    });

    expect(productRepository.save).toHaveBeenCalledTimes(1);
    expect(result.product.name).toBe('Coca-Cola 2L');
    expect(result.product.priceUSD).toBe(3);
    expect(result.product.stock).toBe(10);
  });

  it('lanza ProductNotFoundException si el producto no pertenece al tenant', async () => {
    productRepository.findById.mockResolvedValue(
      buildProduct({ tenantId: 'other-tenant' }),
    );

    await expect(
      useCase.execute({ tenantId, productId: 'p1', priceUSD: 3 }),
    ).rejects.toThrow(ProductNotFoundException);
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it('lanza SkuAlreadyExistsException si el nuevo SKU lo usa otro producto', async () => {
    productRepository.findById.mockResolvedValue(buildProduct());
    productRepository.findBySku.mockResolvedValue(
      buildProduct({ id: 'p2', sku: 'BEB-002' }),
    );

    await expect(
      useCase.execute({ tenantId, productId: 'p1', sku: 'BEB-002' }),
    ).rejects.toThrow(SkuAlreadyExistsException);
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  it('permite mantener el SKU actual sin conflicto', async () => {
    productRepository.findById.mockResolvedValue(buildProduct());

    const result = await useCase.execute({
      tenantId,
      productId: 'p1',
      sku: 'BEB-001',
    });

    expect(result.product.sku).toBe('BEB-001');
    expect(productRepository.findBySku).not.toHaveBeenCalled();
  });
});
