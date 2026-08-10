import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductRequestDto {
  @ApiPropertyOptional({
    example: 'BEB-001',
    description: 'Codigo unico (SKU)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  sku?: string;

  @ApiPropertyOptional({ example: 'Coca-Cola 1.5L', description: 'Nombre' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    example: 'Bebida gaseosa de 1.5 litros',
    description: 'Descripcion (o null)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({ example: 2.5, description: 'Precio en USD' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  priceUSD?: number;

  @ApiPropertyOptional({ example: 1.8, description: 'Costo en USD' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  costUSD?: number;

  @ApiPropertyOptional({ example: 5, description: 'Stock minimo para alerta' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({
    example: 'uuid-de-categoria',
    description: 'ID de la categoria o null para quitarla',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ApiPropertyOptional({ example: true, description: 'Producto activo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
