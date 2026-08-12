import { Module } from '@nestjs/common';
import { ListTenantsUseCase } from '../../../application/use-cases/list-tenants.use-case';
import { UpdateTenantUseCase } from '../../../application/use-cases/update-tenant.use-case';
import { UpdateTenantProfileUseCase } from '../../../application/use-cases/update-tenant-profile.use-case';
import { TenantsController } from '../controllers/tenants.controller';
import { TenantProfileController } from '../controllers/tenant-profile.controller';

@Module({
  controllers: [TenantProfileController, TenantsController],
  providers: [
    ListTenantsUseCase,
    UpdateTenantUseCase,
    UpdateTenantProfileUseCase,
  ],
})
export class TenantsModule {}
