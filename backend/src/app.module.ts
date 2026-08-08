import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { typeOrmModuleOptions } from './infrastructure/persistence/typeorm.config';
import { HealthModule } from './presentation/http/controllers/health.module';

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
    HealthModule,
  ],
})
export class AppModule {}
