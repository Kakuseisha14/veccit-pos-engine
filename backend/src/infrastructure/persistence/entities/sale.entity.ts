import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import { SaleStatus } from '../../../domain/entities/sale.entity';

@Entity('sales')
@Index('IDX_sales_tenant_id', ['tenantId'])
@Index('IDX_sales_tenant_created', ['tenantId', 'createdAt'])
@Index('IDX_sales_tenant_sale_number', ['tenantId', 'saleNumber'], {
  unique: true,
})
export class SaleEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 30 })
  saleNumber!: string;

  @Column({ type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotalUSD!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxUSD!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalUSD!: string;

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  exchangeRateVES!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalVES!: string;

  @Column({ type: 'varchar', length: 20, default: 'COMPLETED' })
  status!: SaleStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
