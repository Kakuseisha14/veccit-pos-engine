import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryRequestDto {
  @ApiProperty({ example: 'Bebidas', description: 'Nombre de la categoria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;
}
