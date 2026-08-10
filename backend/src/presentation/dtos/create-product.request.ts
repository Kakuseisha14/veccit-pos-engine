import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductRequestDto {
  @ApiProperty({
    example: 'BEB-001',
    description: 'Codigo unico (SKU) del producto',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  sku!: string;

  @ApiProperty({
    example: 'Coca-Cola 1.5L',
    description: 'Nombre del producto',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'Bebida gaseosa de 1.5 litros',
    description: 'Descripcion opcional',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 2.5, description: 'Precio de venta en USD' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  priceUSD!: number;

  @ApiPropertyOptional({
    example: 1.8,
    description: 'Costo del producto en USD (solo visible para el admin)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  costUSD?: number;

  @ApiPropertyOptional({ example: 10, description: 'Stock inicial' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 5, description: 'Stock minimo para alerta' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({
    example: 'uuid-de-categoria',
    description: 'ID de la categoria (opcional)',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
