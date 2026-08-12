import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTenantProfileRequestDto {
  @ApiPropertyOptional({ example: 'Mi Tienda C.A.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

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
}
