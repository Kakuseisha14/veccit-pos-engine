import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { TENANT_PLANS } from '../../domain/value-objects/tenant-plan';

export class UpdateTenantRequestDto {
  @ApiPropertyOptional({ example: 'PRO', enum: TENANT_PLANS })
  @IsOptional()
  @IsIn(TENANT_PLANS)
  plan?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
