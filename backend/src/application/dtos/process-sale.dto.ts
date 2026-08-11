import type { PaymentMethod } from '../../domain/entities/sale-payment.entity';
import type { SaleOutput } from './sale.dto';

export interface SaleItemInput {
  productId: string;
  quantity: number;
}

export interface SalePaymentInput {
  paymentMethod: PaymentMethod;
  amount: number;
  currency: 'USD' | 'VES';
  reference?: string | null;
}

export interface ProcessSaleInput {
  tenantId: string;
  customerId?: string | null;
  userId: string;
  items: SaleItemInput[];
  payments: SalePaymentInput[];
  taxUSD?: number;
}

export interface ProcessSaleOutput {
  sale: SaleOutput;
}
