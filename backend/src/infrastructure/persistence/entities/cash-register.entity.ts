import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { ShiftStatus } from '../../../domain/entities/cash-register.entity';

@Entity('cash_registers')
@Index('IDX_cash_registers_tenant_id', ['tenantId'])
@Index('IDX_cash_registers_tenant_opened', ['tenantId', 'openedAt'])
@Index('IDX_cash_registers_tenant_cashier_status', [
  'tenantId',
  'cashierId',
  'status',
])
export class CashRegisterEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'uuid' })
  cashierId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  openingAmountUSD!: string;

  @Column({ type: 'timestamp' })
  openedAt!: Date;

  @Column({ type: 'varchar', length: 10, default: 'OPEN' })
  status!: ShiftStatus;

  @Column({ type: 'timestamp', nullable: true })
  closedAt!: Date | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  closingAmountUSD!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  expectedCashUSD!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  differenceUSD!: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  notes!: string | null;
}
