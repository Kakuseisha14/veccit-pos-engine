import { Module } from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../../application/use-cases/list-users.use-case';
import { UsersController } from '../controllers/users.controller';

@Module({
  controllers: [UsersController],
  providers: [CreateUserUseCase, ListUsersUseCase],
})
export class UsersModule {}
