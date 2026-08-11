import { AdjustStockUseCase } from './adjust-stock.use-case';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import type { IStockAdjustmentRepository } from '../../domain/repositories/stock-adjustment.repository';
import { Product } from '../../domain/entities/product.entity';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';
import { InvalidStockAdjustmentException } from '../../domain/exceptions/invalid-stock-adjustment.exception';

describe('AdjustStockUseCase', () => {
  let useCase: AdjustStockUseCase;
  const productRepository: jest.Mocked<IProductRepository> = {
    findById: jest.fn(),
    findByTenantAndId: jest.fn(),
    findBySku: jest.fn(),
    listByTenant: jest.fn(),
    listLowStock: jest.fn(),
    save: jest.fn(),
    decreaseStock: jest.fn(),
  };
  const stockAdjustmentRepository: jest.Mocked<IStockAdjustmentRepository> = {
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
    useCase = new AdjustStockUseCase(
      productRepository,
      stockAdjustmentRepository,
    );
  });

  it('registra una entrada de stock positiva', async () => {
    productRepository.findById.mockResolvedValue(buildProduct());

    const result = await useCase.execute({
      tenantId,
      productId: 'p1',
      quantity: 5,
      reason: 'Compra a proveedor',
      performedById: 'user-1',
    });

    expect(productRepository.save).toHaveBeenCalledTimes(1);
    expect(stockAdjustmentRepository.save).toHaveBeenCalledTimes(1);
    expect(result.product.stock).toBe(15);
    expect(result.adjustment.quantity).toBe(5);
  });

  it('lanza InsufficientStockException si la salida supera el stock', async () => {
    productRepository.findById.mockResolvedValue(buildProduct({ stock: 3 }));

    await expect(
      useCase.execute({
        tenantId,
        productId: 'p1',
        quantity: -10,
        reason: 'Merma',
        performedById: 'user-1',
      }),
    ).rejects.toThrow(InsufficientStockException);
    expect(productRepository.save).not.toHaveBeenCalled();
    expect(stockAdjustmentRepository.save).not.toHaveBeenCalled();
  });

  it('lanza ProductNotFoundException si el producto es de otro tenant', async () => {
    productRepository.findById.mockResolvedValue(
      buildProduct({ tenantId: 'other-tenant' }),
    );

    await expect(
      useCase.execute({
        tenantId,
        productId: 'p1',
        quantity: 1,
        reason: 'Ajuste',
        performedById: 'user-1',
      }),
    ).rejects.toThrow(ProductNotFoundException);
  });

  it('lanza InvalidStockAdjustmentException si la cantidad es cero', async () => {
    productRepository.findById.mockResolvedValue(buildProduct());

    await expect(
      useCase.execute({
        tenantId,
        productId: 'p1',
        quantity: 0,
        reason: 'Ajuste',
        performedById: 'user-1',
      }),
    ).rejects.toThrow(InvalidStockAdjustmentException);
  });

  it('lanza InvalidStockAdjustmentException si falta el motivo', async () => {
    productRepository.findById.mockResolvedValue(buildProduct());

    await expect(
      useCase.execute({
        tenantId,
        productId: 'p1',
        quantity: 1,
        reason: '   ',
        performedById: 'user-1',
      }),
    ).rejects.toThrow(InvalidStockAdjustmentException);
  });
});
