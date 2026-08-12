import { UpdateTenantUseCase } from './update-tenant.use-case';
import { Tenant } from '../../domain/entities/tenant.entity';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantNotFoundException } from '../../domain/exceptions/tenant-not-found.exception';

function buildTenant(overrides: Partial<Tenant> = {}): Tenant {
  const base = new Tenant(
    't1',
    'Tienda',
    't@tienda.com',
    null,
    null,
    'FREE' as const,
    true,
    new Date('2026-01-01T00:00:00Z'),
    new Date('2026-01-01T00:00:00Z'),
  );
  return new Tenant(
    overrides.id ?? base.id,
    overrides.name ?? base.name,
    overrides.email ?? base.email,
    overrides.phone === undefined ? base.phone : overrides.phone,
    overrides.businessName === undefined
      ? base.businessName
      : overrides.businessName,
    overrides.plan ?? base.plan,
    overrides.isActive ?? base.isActive,
    overrides.createdAt ?? base.createdAt,
    overrides.updatedAt ?? base.updatedAt,
  );
}

describe('UpdateTenantUseCase', () => {
  let useCase: UpdateTenantUseCase;
  const tenantRepository: jest.Mocked<ITenantRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    list: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateTenantUseCase(tenantRepository);
  });

  it('actualiza el plan del tenant', async () => {
    tenantRepository.findById.mockResolvedValue(buildTenant());

    const result = await useCase.execute({ tenantId: 't1', plan: 'PRO' });

    expect(result.tenant.plan).toBe('PRO');
    expect(tenantRepository.save).toHaveBeenCalledTimes(1);
  });

  it('activa/desactiva el tenant', async () => {
    tenantRepository.findById.mockResolvedValue(buildTenant());

    const result = await useCase.execute({ tenantId: 't1', isActive: false });

    expect(result.tenant.isActive).toBe(false);
  });

  it('lanza TenantNotFoundException si el tenant no existe', async () => {
    tenantRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ tenantId: 'missing', plan: 'PRO' }),
    ).rejects.toThrow(TenantNotFoundException);
    expect(tenantRepository.save).not.toHaveBeenCalled();
  });
});
