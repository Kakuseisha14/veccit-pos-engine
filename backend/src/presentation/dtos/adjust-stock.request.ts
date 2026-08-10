import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustStockRequestDto {
  @ApiProperty({
    example: 10,
    description: 'Cantidad: positiva = entrada, negativa = salida',
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(-999999999)
  @Max(999999999)
  quantity!: number;

  @ApiProperty({
    example: 'Compra a proveedor',
    description: 'Motivo del ajuste',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  reason!: string;
}
