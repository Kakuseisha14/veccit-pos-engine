import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCategoryRequestDto {
  @ApiPropertyOptional({
    example: 'Bebidas y Jugos',
    description: 'Nuevo nombre de la categoria',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo/inactivo de la categoria',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
