import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TENANT_PLANS } from '../../domain/value-objects/tenant-plan';

export class RegisterTenantRequestDto {
  @ApiProperty({ example: 'Mi Tienda C.A.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  tenantName!: string;

  @ApiProperty({ example: 'admin@tucomercio.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ example: 'Ana Perez' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  tenantAdminName!: string;

  @ApiPropertyOptional({ example: '+584121234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Mi Tienda C.A.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  businessName?: string;

  @ApiPropertyOptional({ example: 'FREE', enum: TENANT_PLANS })
  @IsOptional()
  @IsIn(TENANT_PLANS)
  plan?: string;
}
