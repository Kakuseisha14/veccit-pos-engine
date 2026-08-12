import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CloseCashRegisterRequestDto {
  @ApiProperty({
    example: 182.5,
    description: 'Monto en efectivo contado al cierre (USD)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  closingAmountUSD!: number;

  @ApiPropertyOptional({
    example: 'Caja sin novedad',
    description: 'Observaciones del arqueo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}
