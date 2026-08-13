import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { typeOrmModuleOptions } from './infrastructure/persistence/typeorm.config';
import { SecurityModule } from './infrastructure/security/security.module';
import { CsrfOriginMiddleware } from './infrastructure/security/csrf-origin.middleware';
import { StorageModule } from './infrastructure/storage/storage.module';
import { TenantContextInterceptor } from './presentation/http/interceptors/tenant-context.interceptor';
import { HealthModule } from './presentation/http/controllers/health.module';
import { AuthModule } from './presentation/http/modules/auth.module';
import { TenantsModule } from './presentation/http/modules/tenants.module';
import { UsersModule } from './presentation/http/modules/users.module';
import { RatesModule } from './presentation/http/modules/rates.module';
import { InventoryModule } from './presentation/http/modules/inventory.module';
import { SalesModule } from './presentation/http/modules/sales.module';
import { CashRegisterModule } from './presentation/http/modules/cash-register.module';
import { MetricsModule } from './presentation/http/modules/metrics.module';
import { UploadsModule } from './presentation/http/modules/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmModuleOptions,
    }),
    PersistenceModule,
    SecurityModule,
    StorageModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    RatesModule,
    InventoryModule,
    SalesModule,
    CashRegisterModule,
    MetricsModule,
    UploadsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CsrfOriginMiddleware).forRoutes('*');
  }
}
