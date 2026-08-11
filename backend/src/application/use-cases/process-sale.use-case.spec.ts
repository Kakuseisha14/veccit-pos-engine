import { ProcessSaleUseCase } from './process-sale.use-case';
import type { IUnitOfWork, ITransactionUnit } from '../services/unit-of-work';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository';
import type { IExchangeRateRepository } from '../../domain/repositories/exchange-rate.repository';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';
import { Product } from '../../domain/entities/product.entity';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { ProductNotFoundException } from '../../domain/exceptions/product-not-found.exception';
import { ExchangeRateNotSetException } from '../../domain/exceptions/exchange-rate-not-set.exception';
import { InsufficientStockException } from '../../domain/exceptions/insufficient-stock.exception';
import { InvalidPaymentTotalException } from '../../domain/exceptions/invalid-payment-total.exception';

describe('ProcessSaleUseCase', () => {
  let useCase: ProcessSaleUseCase;
  const unitOfWork: jest.Mocked<IUnitOfWork> = {
    runInTransaction: jest.fn(),
  };
  const customerRepository: jest.Mocked<ICustomerRepository> = {
    findById: jest.fn(),
    findByTenantAndId: jest.fn(),
    findByTenantAndIdentification: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };
  const exchangeRateRepository: jest.Mocked<IExchangeRateRepository> = {
    findById: jest.fn(),
    findByTenantAndDate: jest.fn(),
    findLatestByTenant: jest.fn(),
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
  };
  const saleRepository: jest.Mocked<ISaleRepository> = {
    findById: jest.fn(),
    findByTenantAndId: jest.fn(),
    listByTenant: jest.fn(),
    nextSaleNumber: jest.fn(),
    save: jest.fn(),
  };
  const unit: ITransactionUnit = {
    productRepository,
    saleRepository,
  };

  const tenantId = 'tenant-1';
  const userId = 'user-1';

  const product = new Product(
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

  const baseInput = {
    tenantId,
    userId,
    items: [{ productId: 'p1', quantity: 2 }],
    payments: [
      {
        paymentMethod: 'CASH_USD' as const,
        amount: 5,
        currency: 'USD' as const,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ProcessSaleUseCase(
      unitOfWork,
      customerRepository,
      exchangeRateRepository,
    );
    unitOfWork.runInTransaction.mockImplementation(async (work) => work(unit));
    exchangeRateRepository.findByTenantAndDate.mockResolvedValue({
      id: 'r1',
      tenantId,
      rateVES: 60,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    productRepository.findByTenantAndId.mockResolvedValue(product);
    saleRepository.nextSaleNumber.mockResolvedValue('V-0001');
    productRepository.decreaseStock.mockResolvedValue();
    saleRepository.save.mockImplementation(async (sale) => sale);
  });

  it('procesa una venta en USD con descuento de stock y guardado', async () => {
    const result = await useCase.execute(baseInput);

    expect(result.sale.saleNumber).toBe('V-0001');
    expect(result.sale.totalUSD).toBe(5);
    expect(result.sale.totalVES).toBe(300);
    expect(result.sale.status).toBe('COMPLETED');
    expect(productRepository.decreaseStock).toHaveBeenCalledWith(
      tenantId,
      'p1',
      2,
    );
    expect(saleRepository.save).toHaveBeenCalledTimes(1);
  });

  it('convierte pagos en VES usando la tasa activa del servidor', async () => {
    const result = await useCase.execute({
      ...baseInput,
      payments: [
        {
          paymentMethod: 'PAGO_MOVIL_VES',
          amount: 300,
          currency: 'VES',
        },
      ],
    });

    const payment = result.sale.payments[0];
    expect(payment.exchangeRateVES).toBe(60);
    expect(payment.amountUSD).toBe(5);
    expect(result.sale.totalUSD).toBe(5);
  });

  it('valida pagos mixtos USD + VES', async () => {
    const result = await useCase.execute({
      ...baseInput,
      payments: [
        { paymentMethod: 'CASH_USD', amount: 2, currency: 'USD' },
        { paymentMethod: 'PAGO_MOVIL_VES', amount: 180, currency: 'VES' },
      ],
    });

    expect(result.sale.totalUSD).toBe(5);
    expect(result.sale.payments).toHaveLength(2);
  });

  it('hace rollback cuando el stock es insuficiente (no guarda la venta)', async () => {
    productRepository.decreaseStock.mockRejectedValue(
      new InsufficientStockException('p1', 1, 2),
    );

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      InsufficientStockException,
    );
    expect(saleRepository.save).not.toHaveBeenCalled();
    expect(unitOfWork.runInTransaction).toHaveBeenCalledTimes(1);
  });

  it('no descuenta stock si los pagos no cubren el total de la venta', async () => {
    await expect(
      useCase.execute({
        ...baseInput,
        payments: [{ paymentMethod: 'CASH_USD', amount: 4, currency: 'USD' }],
      }),
    ).rejects.toThrow(InvalidPaymentTotalException);

    expect(productRepository.decreaseStock).not.toHaveBeenCalled();
    expect(saleRepository.save).not.toHaveBeenCalled();
  });

  it('lanza CustomerNotFoundException si el cliente no pertenece al tenant', async () => {
    customerRepository.findByTenantAndId.mockResolvedValue(null);

    await expect(
      useCase.execute({ ...baseInput, customerId: 'c1' }),
    ).rejects.toThrow(CustomerNotFoundException);
    expect(unitOfWork.runInTransaction).not.toHaveBeenCalled();
  });

  it('lanza ExchangeRateNotSetException si no hay tasa activa', async () => {
    exchangeRateRepository.findByTenantAndDate.mockResolvedValue(null);
    exchangeRateRepository.findLatestByTenant.mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      ExchangeRateNotSetException,
    );
    expect(unitOfWork.runInTransaction).not.toHaveBeenCalled();
  });

  it('lanza ProductNotFoundException si el producto no existe o esta inactivo', async () => {
    productRepository.findByTenantAndId.mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      ProductNotFoundException,
    );
    expect(saleRepository.save).not.toHaveBeenCalled();
  });

  it('no descuenta stock de productos de otro tenant', async () => {
    productRepository.findByTenantAndId.mockResolvedValue(
      new Product(
        'p1',
        'other-tenant',
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
      ),
    );

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      ProductNotFoundException,
    );
    expect(productRepository.decreaseStock).not.toHaveBeenCalled();
  });
});
