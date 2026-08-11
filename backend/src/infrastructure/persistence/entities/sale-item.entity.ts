import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('sale_items')
@Index('IDX_sale_items_sale_id', ['saleId'])
@Index('IDX_sale_items_product_id', ['productId'])
export class SaleItemEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'uuid' })
  saleId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'varchar', length: 120 })
  productName!: string;

  @Column({ type: 'varchar', length: 40 })
  productSku!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPriceUSD!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotalUSD!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
