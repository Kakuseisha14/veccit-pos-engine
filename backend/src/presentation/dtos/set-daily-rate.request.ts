import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetDailyRateRequestDto {
  @ApiProperty({ example: 60.5, description: 'Tasa USD a VES del día' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999)
  rateVES!: number;

  @ApiProperty({
    example: '2026-08-09',
    description: 'Fecha (YYYY-MM-DD). Si se omite, se usa la de hoy',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  date!: string;
}
