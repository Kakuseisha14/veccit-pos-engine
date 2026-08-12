import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetUserActiveRequestDto {
  @ApiProperty({ example: true, description: 'true activa / false desactiva' })
  @IsBoolean()
  isActive!: boolean;
}
