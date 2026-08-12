import type { PaymentMethod } from '../../domain/entities/sale-payment.entity';

export interface SaleItemOutput {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPriceUSD: number;
  subtotalUSD: number;
}

export interface SalePaymentOutput {
  id: string;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: 'USD' | 'VES';
  exchangeRateVES: number;
  amountUSD: number;
  reference: string | null;
}

export interface SaleOutput {
  id: string;
  saleNumber: string;
  customerId: string | null;
  userId: string;
  shiftId: string | null;
  items: SaleItemOutput[];
  payments: SalePaymentOutput[];
  subtotalUSD: number;
  taxUSD: number;
  totalUSD: number;
  exchangeRateVES: number;
  totalVES: number;
  status: string;
  createdAt: Date;
  voidedAt: Date | null;
  voidedByUserId: string | null;
  voidReason: string | null;
}
