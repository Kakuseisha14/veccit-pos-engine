import { ListTenantsUseCase } from './list-tenants.use-case';
import { Tenant } from '../../domain/entities/tenant.entity';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';

describe('ListTenantsUseCase', () => {
  let useCase: ListTenantsUseCase;
  const tenantRepository: jest.Mocked<ITenantRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    list: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListTenantsUseCase(tenantRepository);
  });

  it('devuelve todos los tenants en orden descendente', async () => {
    const tenantA = new Tenant(
      't1',
      'Tienda A',
      'a@tienda.com',
      null,
      null,
      'FREE',
      true,
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-01T00:00:00Z'),
    );
    const tenantB = new Tenant(
      't2',
      'Tienda B',
      'b@tienda.com',
      '+584121234567',
      'Tienda B C.A.',
      'PRO',
      false,
      new Date('2026-02-01T00:00:00Z'),
      new Date('2026-02-01T00:00:00Z'),
    );
    tenantRepository.list.mockResolvedValue([tenantB, tenantA]);

    const result = await useCase.execute();

    expect(tenantRepository.list).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 't2',
      name: 'Tienda B',
      email: 'b@tienda.com',
      phone: '+584121234567',
      businessName: 'Tienda B C.A.',
      plan: 'PRO',
      isActive: false,
      createdAt: tenantB.createdAt,
      updatedAt: tenantB.updatedAt,
    });
    expect(result[1].plan).toBe('FREE');
  });
});
