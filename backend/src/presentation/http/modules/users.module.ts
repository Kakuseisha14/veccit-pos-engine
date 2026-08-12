import { Module } from '@nestjs/common';
import { StorageModule } from '../../../infrastructure/storage/storage.module';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../../application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case';
import { SetUserActiveUseCase } from '../../../application/use-cases/set-user-active.use-case';
import { UploadAvatarUseCase } from '../../../application/use-cases/upload-avatar.use-case';
import { UsersController } from '../controllers/users.controller';

@Module({
  imports: [StorageModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    SetUserActiveUseCase,
    UploadAvatarUseCase,
  ],
})
export class UsersModule {}
