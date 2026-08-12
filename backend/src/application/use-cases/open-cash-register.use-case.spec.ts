import { OpenCashRegisterUseCase } from './open-cash-register.use-case';
import type { ICashRegisterRepository } from '../../domain/repositories/cash-register.repository';
import { CashRegister } from '../../domain/entities/cash-register.entity';
import { ShiftAlreadyOpenException } from '../../domain/exceptions/shift-already-open.exception';

describe('OpenCashRegisterUseCase', () => {
  let useCase: OpenCashRegisterUseCase;
  const cashRegisterRepository: jest.Mocked<ICashRegisterRepository> = {
    findOpenByTenantAndCashier: jest.fn(),
    findByTenantAndId: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new OpenCashRegisterUseCase(cashRegisterRepository);
  });

  it('abre un turno de caja cuando no hay otro abierto', async () => {
    cashRegisterRepository.findOpenByTenantAndCashier.mockResolvedValue(null);
    cashRegisterRepository.save.mockImplementation(async (shift) => shift);

    const result = await useCase.execute({
      tenantId: 'tenant-1',
      cashierId: 'user-1',
      openingAmountUSD: 50,
    });

    expect(result.shift.status).toBe('OPEN');
    expect(result.shift.cashierId).toBe('user-1');
    expect(result.shift.openingAmountUSD).toBe(50);
    expect(cashRegisterRepository.save).toHaveBeenCalledTimes(1);
  });

  it('lanza ShiftAlreadyOpenException si el cajero ya tiene un turno abierto', async () => {
    const openShift = CashRegister.open({
      tenantId: 'tenant-1',
      cashierId: 'user-1',
      openingAmountUSD: 50,
    });
    cashRegisterRepository.findOpenByTenantAndCashier.mockResolvedValue(
      openShift,
    );

    await expect(
      useCase.execute({
        tenantId: 'tenant-1',
        cashierId: 'user-1',
        openingAmountUSD: 50,
      }),
    ).rejects.toThrow(ShiftAlreadyOpenException);
    expect(cashRegisterRepository.save).not.toHaveBeenCalled();
  });
});
