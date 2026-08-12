import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../../../application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case';
import { SetUserActiveUseCase } from '../../../application/use-cases/set-user-active.use-case';
import { UploadAvatarUseCase } from '../../../application/use-cases/upload-avatar.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { CannotDeactivateSelfException } from '../../../domain/exceptions/cannot-deactivate-self.exception';
import { InvalidRoleException } from '../../../domain/exceptions/invalid-role.exception';
import { InvalidAvatarException } from '../../../domain/exceptions/invalid-avatar.exception';
import { CreateUserRequestDto } from '../../dtos/create-user.request';
import { UpdateUserRequestDto } from '../../dtos/update-user.request';
import { SetUserActiveRequestDto } from '../../dtos/set-user-active.request';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { Roles } from '../guards/roles.decorator';

const AVATAR_MAX_SIZE = 2 * 1024 * 1024;

@ApiTags('Users')
@ApiCookieAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('TENANT_ADMIN')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly setUserActiveUseCase: SetUserActiveUseCase,
    private readonly uploadAvatarUseCase: UploadAvatarUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear un usuario (cajero) del tenant' })
  @Post()
  create(@Body() dto: CreateUserRequestDto) {
    return this.createUserUseCase.execute({
      tenantId: this.requireTenantId(),
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });
  }

  @ApiOperation({ summary: 'Listar usuarios del tenant' })
  @Get()
  list() {
    return this.listUsersUseCase.execute(this.requireTenantId());
  }

  @ApiOperation({ summary: 'Actualizar nombre y/o rol de un usuario' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserRequestDto) {
    try {
      return await this.updateUserUseCase.execute({
        tenantId: this.requireTenantId(),
        userId: id,
        name: dto.name,
        role: dto.role,
      });
    } catch (err) {
      this.mapUserErrors(err);
      throw err;
    }
  }

  @ApiOperation({ summary: 'Activar o desactivar un usuario' })
  @Patch(':id/active')
  async setActive(
    @Param('id') id: string,
    @Body() dto: SetUserActiveRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const actorId = request.user?.sub;
    if (!actorId) {
      throw new ForbiddenException('No se pudo identificar al usuario');
    }
    try {
      return await this.setUserActiveUseCase.execute({
        tenantId: this.requireTenantId(),
        userId: id,
        actorId,
        isActive: dto.isActive,
      });
    } catch (err) {
      this.mapUserErrors(err);
      throw err;
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen PNG, JPG o WEBP (max 2MB)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Subir/actualizar el avatar de un usuario' })
  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_MAX_SIZE },
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Debe adjuntar un archivo de imagen');
    }
    try {
      return await this.uploadAvatarUseCase.execute({
        tenantId: this.requireTenantId(),
        userId: id,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      });
    } catch (err) {
      this.mapUserErrors(err);
      throw err;
    }
  }

  private requireTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Se requiere un contexto de inquilino (tenant) activo',
      );
    }
    return tenantId;
  }

  private mapUserErrors(err: unknown): void {
    if (err instanceof UserNotFoundException) {
      throw new NotFoundException(err.message);
    }
    if (
      err instanceof CannotDeactivateSelfException ||
      err instanceof InvalidRoleException ||
      err instanceof InvalidAvatarException
    ) {
      throw new BadRequestException(err.message);
    }
  }
}
