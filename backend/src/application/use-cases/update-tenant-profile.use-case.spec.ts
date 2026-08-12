import { UpdateTenantProfileUseCase } from './update-tenant-profile.use-case';
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

describe('UpdateTenantProfileUseCase', () => {
  let useCase: UpdateTenantProfileUseCase;
  const tenantRepository: jest.Mocked<ITenantRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    list: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateTenantProfileUseCase(tenantRepository);
  });

  it('actualiza nombre, telefono y razon social', async () => {
    tenantRepository.findById.mockResolvedValue(buildTenant());

    const result = await useCase.execute({
      tenantId: 't1',
      name: 'Nueva Tienda',
      phone: '+584121234567',
      businessName: 'Nueva Tienda C.A.',
    });

    expect(result.tenant.name).toBe('Nueva Tienda');
    expect(result.tenant.phone).toBe('+584121234567');
    expect(result.tenant.businessName).toBe('Nueva Tienda C.A.');
    expect(tenantRepository.save).toHaveBeenCalledTimes(1);
  });

  it('no guarda si no hay cambios', async () => {
    tenantRepository.findById.mockResolvedValue(buildTenant());

    await useCase.execute({ tenantId: 't1' });

    expect(tenantRepository.save).not.toHaveBeenCalled();
  });

  it('lanza TenantNotFoundException si el tenant no existe', async () => {
    tenantRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ tenantId: 'missing', name: 'X' }),
    ).rejects.toThrow(TenantNotFoundException);
  });
});
