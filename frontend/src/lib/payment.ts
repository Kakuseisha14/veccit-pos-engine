export type PaymentCurrency = "USD" | "VES";

export interface PaymentLike {
  amount: string;
  currency: PaymentCurrency;
}

export const toCents = (value: number): number => Math.round(value * 100);

const MAX_CENTS_TOLERANCE = 2;

export function computeTotalCents(items: {
  unitPriceUSD: number;
  quantity: number;
}[]): number {
  return items.reduce(
    (sum, item) => sum + toCents(item.unitPriceUSD) * item.quantity,
    0,
  );
}

export function computePaidCents(
  payments: PaymentLike[],
  rateVES: number | null,
): number {
  return payments.reduce((sum, payment) => {
    const amount = Number.parseFloat(payment.amount);
    if (!Number.isFinite(amount) || amount < 0) return sum;
    if (payment.currency === "USD") return sum + toCents(amount);
    if (!rateVES || rateVES <= 0) return sum;
    return sum + toCents(amount / rateVES);
  }, 0);
}

export function computeRemainingCents(
  totalUSD: number,
  payments: PaymentLike[],
  rateVES: number | null,
): number {
  return toCents(totalUSD) - computePaidCents(payments, rateVES);
}

export function canConfirmPayment(
  totalUSD: number,
  payments: PaymentLike[],
  rateVES: number | null,
): boolean {
  return Math.abs(computeRemainingCents(totalUSD, payments, rateVES)) <= MAX_CENTS_TOLERANCE;
}

export function hasUnpricedVesPayment(payments: PaymentLike[]): boolean {
  return payments.some((payment) => payment.currency === "VES");
}