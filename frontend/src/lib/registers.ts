import { apiFetch } from "./api";
import type { PaymentMethod, Sale } from "./sales";

export type ShiftStatus = "OPEN" | "CLOSED";

export interface CashRegister {
  id: string;
  cashierId: string;
  openingAmountUSD: number;
  openedAt: string;
  status: ShiftStatus;
  closedAt: string | null;
  closingAmountUSD: number | null;
  expectedCashUSD: number | null;
  differenceUSD: number | null;
  notes: string | null;
}

export interface PaymentMethodSummary {
  paymentMethod: PaymentMethod;
  totalUSD: number;
  count: number;
}

export interface ShiftSummary {
  shift: CashRegister;
  salesCount: number;
  voidedSalesCount: number;
  totalSalesUSD: number;
  totalVoidedUSD: number;
  expectedCashUSD: number;
  payments: PaymentMethodSummary[];
  sales: Sale[];
}

export function openCashRegister(
  openingAmountUSD: number,
): Promise<{ shift: CashRegister }> {
  return apiFetch<{ shift: CashRegister }>("/cash-registers/open", {
    method: "POST",
    body: JSON.stringify({ openingAmountUSD }),
  });
}

export function closeCashRegister(
  id: string,
  payload: { closingAmountUSD: number; notes?: string },
): Promise<{ shift: CashRegister }> {
  return apiFetch<{ shift: CashRegister }>(`/cash-registers/${id}/close`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getShiftSummary(id: string): Promise<ShiftSummary> {
  return apiFetch<ShiftSummary>(`/cash-registers/${id}/summary`);
}

export function listCashRegisters(): Promise<{ shifts: CashRegister[] }> {
  return apiFetch<{ shifts: CashRegister[] }>("/cash-registers");
}