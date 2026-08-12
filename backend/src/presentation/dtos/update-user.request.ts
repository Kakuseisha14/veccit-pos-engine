import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ROLES, type Role } from '../../domain/value-objects/role';

export class UpdateUserRequestDto {
  @ApiPropertyOptional({ example: 'Juan Perez' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ enum: ROLES, example: 'CASHIER' })
  @IsOptional()
  @IsIn(ROLES)
  role?: Role;
}
