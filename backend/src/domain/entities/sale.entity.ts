import { randomUUID } from 'node:crypto';
import { SaleItem, CreateSaleItemInput } from './sale-item.entity';
import { SalePayment, CreateSalePaymentInput } from './sale-payment.entity';
import { InvalidPaymentTotalException } from '../exceptions/invalid-payment-total.exception';
import { SaleAlreadyVoidedException } from '../exceptions/sale-already-voided.exception';

export type SaleStatus = 'COMPLETED' | 'VOIDED';

export interface CreateSaleInput {
  tenantId: string;
  saleNumber: string;
  customerId?: string | null;
  userId: string;
  shiftId?: string | null;
  items: CreateSaleItemInput[];
  payments: CreateSalePaymentInput[];
  exchangeRateVES: number;
  taxUSD?: number;
}

export class Sale {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly saleNumber: string,
    public readonly customerId: string | null,
    public readonly userId: string,
    public readonly shiftId: string | null,
    public readonly items: SaleItem[],
    public readonly payments: SalePayment[],
    public readonly subtotalUSD: number,
    public readonly taxUSD: number,
    public readonly totalUSD: number,
    public readonly exchangeRateVES: number,
    public readonly totalVES: number,
    public readonly status: SaleStatus,
    public readonly createdAt: Date,
    public readonly voidedAt: Date | null,
    public readonly voidedByUserId: string | null,
    public readonly voidReason: string | null,
  ) {}

  static create(input: CreateSaleInput): Sale {
    if (!input.items || input.items.length === 0) {
      throw new Error('La venta debe contener al menos un producto');
    }
    if (!input.payments || input.payments.length === 0) {
      throw new Error('La venta debe contener al menos un pago');
    }
    if (input.exchangeRateVES <= 0) {
      throw new Error('La tasa de cambio debe ser mayor a 0');
    }

    const saleId = randomUUID();
    const items = input.items.map((item) => SaleItem.create(saleId, item));

    const subtotalUSD = Number(
      items.reduce((sum, item) => sum + item.subtotalUSD, 0).toFixed(2),
    );
    const taxUSD = Number((input.taxUSD ?? 0).toFixed(2));
    const totalUSD = Number((subtotalUSD + taxUSD).toFixed(2));
    const totalVES = Number((totalUSD * input.exchangeRateVES).toFixed(2));

    const payments = input.payments.map((p) => SalePayment.create(saleId, p));
    const totalReceivedUSD = Number(
      payments.reduce((sum, p) => sum + p.amountUSD, 0).toFixed(2),
    );

    // Permitir tolerancia de centavos (+/- 0.02 USD) por conversiones de moneda
    if (Math.abs(totalReceivedUSD - totalUSD) > 0.02) {
      throw new InvalidPaymentTotalException(totalUSD, totalReceivedUSD);
    }

    return new Sale(
      saleId,
      input.tenantId,
      input.saleNumber,
      input.customerId ?? null,
      input.userId,
      input.shiftId ?? null,
      items,
      payments,
      subtotalUSD,
      taxUSD,
      totalUSD,
      input.exchangeRateVES,
      totalVES,
      'COMPLETED',
      new Date(),
      null,
      null,
      null,
    );
  }

  void(input: { voidedByUserId: string; reason?: string | null }): Sale {
    if (this.status === 'VOIDED') {
      throw new SaleAlreadyVoidedException(this.id);
    }
    return new Sale(
      this.id,
      this.tenantId,
      this.saleNumber,
      this.customerId,
      this.userId,
      this.shiftId,
      this.items,
      this.payments,
      this.subtotalUSD,
      this.taxUSD,
      this.totalUSD,
      this.exchangeRateVES,
      this.totalVES,
      'VOIDED',
      this.createdAt,
      new Date(),
      input.voidedByUserId,
      input.reason?.trim() || null,
    );
  }
}
