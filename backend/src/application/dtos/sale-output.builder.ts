import type { Sale } from '../../domain/entities/sale.entity';
import type { SaleOutput } from './sale.dto';

export function toSaleOutput(sale: Sale): SaleOutput {
  return {
    id: sale.id,
    saleNumber: sale.saleNumber,
    customerId: sale.customerId,
    userId: sale.userId,
    shiftId: sale.shiftId,
    items: sale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPriceUSD: item.unitPriceUSD,
      subtotalUSD: item.subtotalUSD,
    })),
    payments: sale.payments.map((payment) => ({
      id: payment.id,
      paymentMethod: payment.paymentMethod,
      amount: payment.amount,
      currency: payment.currency,
      exchangeRateVES: payment.exchangeRateVES,
      amountUSD: payment.amountUSD,
      reference: payment.reference,
    })),
    subtotalUSD: sale.subtotalUSD,
    taxUSD: sale.taxUSD,
    totalUSD: sale.totalUSD,
    exchangeRateVES: sale.exchangeRateVES,
    totalVES: sale.totalVES,
    status: sale.status,
    createdAt: sale.createdAt,
    voidedAt: sale.voidedAt,
    voidedByUserId: sale.voidedByUserId,
    voidReason: sale.voidReason,
  };
}
