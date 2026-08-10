import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('stock_adjustments')
@Index('IDX_stock_adjustments_tenant_product', ['tenantId', 'productId'])
export class StockAdjustmentEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'varchar', length: 300 })
  reason!: string;

  @Column({ type: 'uuid' })
  performedById!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
