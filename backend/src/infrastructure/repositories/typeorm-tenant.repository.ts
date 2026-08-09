import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ITenantRepository } from '../../domain/repositories/tenant.repository';
import type { Tenant } from '../../domain/entities/tenant.entity';
import { TenantEntity } from '../persistence/entities/tenant.entity';
import {
  toDomainTenant,
  toEntityTenant,
} from '../persistence/mappers/tenant.mapper';

@Injectable()
export class TypeOrmTenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repository: Repository<TenantEntity>,
  ) {}

  async findById(id: string): Promise<Tenant | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? toDomainTenant(entity) : null;
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    const entity = await this.repository.findOneBy({
      email: email.toLowerCase().trim(),
    });
    return entity ? toDomainTenant(entity) : null;
  }

  async save(tenant: Tenant): Promise<Tenant> {
    await this.repository.save(toEntityTenant(tenant));
    return tenant;
  }
}
