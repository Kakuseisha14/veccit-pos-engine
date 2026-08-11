import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../../domain/entities/sale-payment.entity';

export class SaleItemRequestDto {
  @ApiProperty({ example: 'uuid-del-producto' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 2 })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  @Max(1000000)
  quantity!: number;
}

export class SalePaymentRequestDto {
  @ApiProperty({
    enum: [
      'CASH_USD',
      'CASH_VES',
      'PAGO_MOVIL_VES',
      'CARD_VES',
      'ZELLE_USD',
      'OTHER',
    ],
    example: 'CASH_USD',
    description: 'Metodo de pago usado',
  })
  @IsIn([
    'CASH_USD',
    'CASH_VES',
    'PAGO_MOVIL_VES',
    'CARD_VES',
    'ZELLE_USD',
    'OTHER',
  ])
  paymentMethod!: PaymentMethod;

  @ApiProperty({
    example: 10.0,
    description: 'Monto abonado en la divisa indicada',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  amount!: number;

  @ApiProperty({ enum: ['USD', 'VES'], example: 'USD' })
  @IsIn(['USD', 'VES'])
  currency!: 'USD' | 'VES';

  @ApiPropertyOptional({
    example: 'REF-PM-123456',
    description: 'Referencia del pago (ej. numero de operacion)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reference?: string;
}

export class ProcessSaleRequestDto {
  @ApiPropertyOptional({
    example: 'uuid-del-cliente',
    description: 'Cliente opcional',
  })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ type: [SaleItemRequestDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemRequestDto)
  items!: SaleItemRequestDto[];

  @ApiProperty({ type: [SalePaymentRequestDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SalePaymentRequestDto)
  payments!: SalePaymentRequestDto[];

  @ApiPropertyOptional({ example: 0, description: 'Impuesto opcional en USD' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  taxUSD?: number;
}
