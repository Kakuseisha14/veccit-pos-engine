import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class OpenCashRegisterRequestDto {
  @ApiProperty({
    example: 50.0,
    description: 'Monto inicial en efectivo de la caja (USD)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  openingAmountUSD!: number;
}
