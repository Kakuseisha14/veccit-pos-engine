import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmModuleOptions = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: config.get<number>('DB_PORT', 5432),
  username: config.get<string>('DB_USERNAME', 'postgres'),
  password: config.get<string>('DB_PASSWORD', 'postgres'),
  database: config.get<string>('DB_DATABASE', 'veccit_pos'),
  autoLoadEntities: true,
  synchronize: false,
  logging: ['error', 'warn'],
});
