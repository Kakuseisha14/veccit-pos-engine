import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TENANT_REPOSITORY } from '../../domain/repositories/tenant.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { EXCHANGE_RATE_REPOSITORY } from '../../domain/repositories/exchange-rate.repository';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import { STOCK_ADJUSTMENT_REPOSITORY } from '../../domain/repositories/stock-adjustment.repository';
import { TenantEntity } from './entities/tenant.entity';
import { UserEntity } from './entities/user.entity';
import { ExchangeRateEntity } from './entities/exchange-rate.entity';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';
import { StockAdjustmentEntity } from './entities/stock-adjustment.entity';
import { TypeOrmTenantRepository } from '../repositories/typeorm-tenant.repository';
import { TypeOrmUserRepository } from '../repositories/typeorm-user.repository';
import { TypeOrmExchangeRateRepository } from '../repositories/typeorm-exchange-rate.repository';
import { TypeOrmCategoryRepository } from '../repositories/typeorm-category.repository';
import { TypeOrmProductRepository } from '../repositories/typeorm-product.repository';
import { TypeOrmStockAdjustmentRepository } from '../repositories/typeorm-stock-adjustment.repository';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      UserEntity,
      ExchangeRateEntity,
      CategoryEntity,
      ProductEntity,
      StockAdjustmentEntity,
    ]),
  ],
  providers: [
    { provide: TENANT_REPOSITORY, useClass: TypeOrmTenantRepository },
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    {
      provide: EXCHANGE_RATE_REPOSITORY,
      useClass: TypeOrmExchangeRateRepository,
    },
    { provide: CATEGORY_REPOSITORY, useClass: TypeOrmCategoryRepository },
    { provide: PRODUCT_REPOSITORY, useClass: TypeOrmProductRepository },
    {
      provide: STOCK_ADJUSTMENT_REPOSITORY,
      useClass: TypeOrmStockAdjustmentRepository,
    },
  ],
  exports: [
    TENANT_REPOSITORY,
    USER_REPOSITORY,
    EXCHANGE_RATE_REPOSITORY,
    CATEGORY_REPOSITORY,
    PRODUCT_REPOSITORY,
    STOCK_ADJUSTMENT_REPOSITORY,
  ],
})
export class PersistenceModule {}
