import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import { PaymentMethod } from '../../../domain/entities/sale-payment.entity';

@Entity('sale_payments')
@Index('IDX_sale_payments_sale_id', ['saleId'])
export class SalePaymentEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'uuid' })
  saleId!: string;

  @Column({ type: 'varchar', length: 30 })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 3 })
  currency!: 'USD' | 'VES';

  @Column({ type: 'decimal', precision: 14, scale: 4 })
  exchangeRateVES!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amountUSD!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
