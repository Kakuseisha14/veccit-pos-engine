import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { UserEntity } from './entities/user.entity';
import { ExchangeRateEntity } from './entities/exchange-rate.entity';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from './entities/product.entity';
import { StockAdjustmentEntity } from './entities/stock-adjustment.entity';
import { CustomerEntity } from './entities/customer.entity';
import { SaleEntity } from './entities/sale.entity';
import { SaleItemEntity } from './entities/sale-item.entity';
import { SalePaymentEntity } from './entities/sale-payment.entity';
import { CashRegisterEntity } from './entities/cash-register.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'veccit_pos',
  entities: [
    TenantEntity,
    UserEntity,
    ExchangeRateEntity,
    CategoryEntity,
    ProductEntity,
    StockAdjustmentEntity,
    CustomerEntity,
    SaleEntity,
    SaleItemEntity,
    SalePaymentEntity,
    CashRegisterEntity,
  ],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
  logging: ['error', 'warn'],
});
