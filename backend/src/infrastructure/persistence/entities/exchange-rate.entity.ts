import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('exchange_rates')
@Index('IDX_exchange_rates_tenant_date', ['tenantId', 'date'], {
  unique: true,
})
export class ExchangeRateEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  rateVES!: string;

  @Column({ type: 'date' })
  date!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
