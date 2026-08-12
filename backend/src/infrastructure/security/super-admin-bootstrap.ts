import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IPasswordHasher } from '../../application/services/password-hasher.service';
import { PASSWORD_HASHER } from '../../application/services/password-hasher.service';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class SuperAdminBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SuperAdminBootstrapService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.config.get<string>('SUPER_ADMIN_EMAIL');
    const password = this.config.get<string>('SUPER_ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn(
        'SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD no definidos; se omite el bootstrap del super admin.',
      );
      return;
    }

    const existing = await this.userRepository.findByEmail(
      email.toLowerCase().trim(),
    );
    if (existing) {
      this.logger.log('Super admin ya existe; bootstrap omitido.');
      return;
    }

    const existsRole = await this.findAnySuperAdmin();
    if (existsRole) {
      this.logger.log(
        'Ya existe un super admin en el sistema; no se creó la cuenta de entorno.',
      );
      return;
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const superAdmin = User.create({
      tenantId: null,
      name: 'Super Admin',
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
    });
    await this.userRepository.save(superAdmin);
    this.logger.log(
      `Super admin creado para ${superAdmin.email} (sin tenant).`,
    );
  }

  private async findAnySuperAdmin(): Promise<boolean> {
    const users = await this.userRepository.listByRole('SUPER_ADMIN');
    return users.length > 0;
  }
}
