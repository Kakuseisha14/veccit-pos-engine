import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuickRegisterCustomerRequestDto {
  @ApiProperty({
    example: 'V-12345678',
    description: 'Identificacion del cliente (cedula, RIF o pasaporte)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  identification!: string;

  @ApiProperty({
    example: 'Juan Perez',
    description: 'Nombre completo del cliente',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({ example: 'juan@correo.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({ example: '04141234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Calle 1, Sector Centro' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}
