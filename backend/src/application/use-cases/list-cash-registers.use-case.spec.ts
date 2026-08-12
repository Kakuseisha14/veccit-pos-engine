import { ListCashRegistersUseCase } from './list-cash-registers.use-case';
import type { ICashRegisterRepository } from '../../domain/repositories/cash-register.repository';
import { CashRegister } from '../../domain/entities/cash-register.entity';

describe('ListCashRegistersUseCase', () => {
  let useCase: ListCashRegistersUseCase;
  const cashRegisterRepository: jest.Mocked<ICashRegisterRepository> = {
    findOpenByTenantAndCashier: jest.fn(),
    findByTenantAndId: jest.fn(),
    listByTenant: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListCashRegistersUseCase(cashRegisterRepository);
  });

  it('lista los turnos de caja del tenant', async () => {
    const open = CashRegister.open({
      tenantId: 'tenant-1',
      cashierId: 'user-1',
      openingAmountUSD: 50,
    });
    const closed = open.close({
      closingAmountUSD: 120,
      expectedCashUSD: 120,
    });
    cashRegisterRepository.listByTenant.mockResolvedValue([closed, open]);

    const result = await useCase.execute({ tenantId: 'tenant-1' });

    expect(cashRegisterRepository.listByTenant).toHaveBeenCalledWith(
      'tenant-1',
    );
    expect(result.shifts).toHaveLength(2);
    expect(result.shifts[0].status).toBe('CLOSED');
    expect(result.shifts[1].status).toBe('OPEN');
  });
});
