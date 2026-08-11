import { randomUUID } from 'node:crypto';

export type PaymentMethod =
  | 'CASH_USD'
  | 'CASH_VES'
  | 'PAGO_MOVIL_VES'
  | 'CARD_VES'
  | 'ZELLE_USD'
  | 'OTHER';

export interface CreateSalePaymentInput {
  paymentMethod: PaymentMethod;
  amount: number;
  currency: 'USD' | 'VES';
  exchangeRateVES: number;
  reference?: string | null;
}

export class SalePayment {
  constructor(
    public readonly id: string,
    public readonly saleId: string,
    public readonly paymentMethod: PaymentMethod,
    public readonly amount: number,
    public readonly currency: 'USD' | 'VES',
    public readonly exchangeRateVES: number,
    public readonly amountUSD: number,
    public readonly reference: string | null,
  ) {}

  static create(saleId: string, input: CreateSalePaymentInput): SalePayment {
    let amountUSD = 0;
    if (input.currency === 'USD') {
      amountUSD = Number(input.amount.toFixed(2));
    } else {
      if (input.exchangeRateVES <= 0) {
        throw new Error(
          'La tasa de cambio debe ser un número positivo mayor que 0',
        );
      }
      amountUSD = Number((input.amount / input.exchangeRateVES).toFixed(2));
    }

    return new SalePayment(
      randomUUID(),
      saleId,
      input.paymentMethod,
      input.amount,
      input.currency,
      input.exchangeRateVES,
      amountUSD,
      input.reference?.trim() || null,
    );
  }
}
