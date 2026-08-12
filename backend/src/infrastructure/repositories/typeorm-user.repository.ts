import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { User } from '../../domain/entities/user.entity';
import { UserEntity } from '../persistence/entities/user.entity';
import { toDomainUser, toEntityUser } from '../persistence/mappers/user.mapper';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? toDomainUser(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOneBy({
      email: email.toLowerCase().trim(),
    });
    return entity ? toDomainUser(entity) : null;
  }

  async findByTenantAndId(tenantId: string, id: string): Promise<User | null> {
    const entity = await this.repository.findOneBy({ tenantId, id });
    return entity ? toDomainUser(entity) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.countBy({
      email: email.toLowerCase().trim(),
    });
    return count > 0;
  }

  async listByTenant(tenantId: string): Promise<User[]> {
    const entities = await this.repository.findBy({ tenantId });
    return entities.map(toDomainUser);
  }

  async save(user: User): Promise<User> {
    await this.repository.save(toEntityUser(user));
    return user;
  }
}
