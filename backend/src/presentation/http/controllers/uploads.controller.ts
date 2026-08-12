import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { GetAvatarUseCase } from '../../../application/use-cases/get-avatar.use-case';
import { TenantContext } from '../../../infrastructure/tenant/tenant-context';
import { AvatarNotFoundException } from '../../../domain/exceptions/avatar-not-found.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';

@ApiTags('Uploads')
@ApiCookieAuth()
@Controller('uploads/avatars')
@UseGuards(JwtAuthGuard, TenantGuard)
export class UploadsController {
  constructor(private readonly getAvatarUseCase: GetAvatarUseCase) {}

  @ApiOperation({
    summary: 'Obtener el avatar de un usuario del tenant (aislado por tenant)',
  })
  @Get(':userId')
  async getAvatar(@Param('userId') userId: string, @Res() res: Response) {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new ForbiddenException(
        'Se requiere un contexto de inquilino (tenant) activo',
      );
    }

    let output;
    try {
      output = await this.getAvatarUseCase.execute({ tenantId, userId });
    } catch (err) {
      if (
        err instanceof UserNotFoundException ||
        err instanceof AvatarNotFoundException
      ) {
        throw new NotFoundException(err.message);
      }
      throw err;
    }

    res.setHeader('Content-Type', output.contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    output.stream.on('error', () => {
      res.status(404).end();
    });
    output.stream.pipe(res);
  }
}
