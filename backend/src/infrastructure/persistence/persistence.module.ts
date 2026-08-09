import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TENANT_REPOSITORY } from '../../domain/repositories/tenant.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { EXCHANGE_RATE_REPOSITORY } from '../../domain/repositories/exchange-rate.repository';
import { TenantEntity } from './entities/tenant.entity';
import { UserEntity } from './entities/user.entity';
import { ExchangeRateEntity } from './entities/exchange-rate.entity';
import { TypeOrmTenantRepository } from '../repositories/typeorm-tenant.repository';
import { TypeOrmUserRepository } from '../repositories/typeorm-user.repository';
import { TypeOrmExchangeRateRepository } from '../repositories/typeorm-exchange-rate.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([TenantEntity, UserEntity, ExchangeRateEntity]),
  ],
  providers: [
    { provide: TENANT_REPOSITORY, useClass: TypeOrmTenantRepository },
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    {
      provide: EXCHANGE_RATE_REPOSITORY,
      useClass: TypeOrmExchangeRateRepository,
    },
  ],
  exports: [TENANT_REPOSITORY, USER_REPOSITORY, EXCHANGE_RATE_REPOSITORY],
})
export class PersistenceModule {}
