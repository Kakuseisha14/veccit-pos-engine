import { apiFetch } from "./api";

export type PaymentMethod =
  | "CASH_USD"
  | "CASH_VES"
  | "PAGO_MOVIL_VES"
  | "CARD_VES"
  | "ZELLE_USD"
  | "OTHER";

export type PaymentCurrency = "USD" | "VES";

export interface Customer {
  id: string;
  identification: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPriceUSD: number;
  subtotalUSD: number;
}

export interface SalePayment {
  id: string;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: PaymentCurrency;
  exchangeRateVES: number;
  amountUSD: number;
  reference: string | null;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId: string | null;
  userId: string;
  shiftId: string | null;
  items: SaleItem[];
  payments: SalePayment[];
  subtotalUSD: number;
  taxUSD: number;
  totalUSD: number;
  exchangeRateVES: number;
  totalVES: number;
  status: string;
  createdAt: string;
  voidedAt: string | null;
  voidedByUserId: string | null;
  voidReason: string | null;
}

export interface ProcessSalePayload {
  customerId?: string;
  items: { productId: string; quantity: number }[];
  payments: {
    paymentMethod: PaymentMethod;
    amount: number;
    currency: PaymentCurrency;
    reference?: string;
  }[];
  taxUSD?: number;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH_USD: "Efectivo USD",
  CASH_VES: "Efectivo VES",
  PAGO_MOVIL_VES: "Pago Movil",
  CARD_VES: "Tarjeta / Punto",
  ZELLE_USD: "Zelle",
  OTHER: "Otro",
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH_USD",
  "CASH_VES",
  "PAGO_MOVIL_VES",
  "CARD_VES",
  "ZELLE_USD",
  "OTHER",
];

export function listCustomers(): Promise<{ customers: Customer[] }> {
  return apiFetch<{ customers: Customer[] }>("/customers");
}

export function quickRegisterCustomer(payload: {
  identification: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}): Promise<{ customer: Customer }> {
  return apiFetch<{ customer: Customer }>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function processSale(
  payload: ProcessSalePayload,
): Promise<{ sale: Sale }> {
  return apiFetch<{ sale: Sale }>("/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listSales(): Promise<{ sales: Sale[] }> {
  return apiFetch<{ sales: Sale[] }>("/sales");
}

export function voidSale(
  id: string,
  reason?: string,
): Promise<{ sale: Sale }> {
  return apiFetch<{ sale: Sale }>(`/sales/${id}/void`, {
    method: "POST",
    body: JSON.stringify(reason ? { reason } : {}),
  });
}
