import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class VoidSaleRequestDto {
  @ApiPropertyOptional({
    example: 'Cliente se arrepintio',
    description: 'Motivo de la anulacion',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
