import { apiFetch } from "./api";

export interface DashboardMetricTotals {
  salesCount: number;
  salesUSD: number;
  grossProfitUSD: number;
}

export interface BestSellingProduct {
  productId: string;
  productName: string;
  productSku: string;
  quantitySold: number;
}

export interface DailySalesPoint {
  date: string;
  salesCount: number;
  salesUSD: number;
}

export interface DashboardMetrics {
  today: DashboardMetricTotals;
  last7Days: DashboardMetricTotals;
  dailySales: DailySalesPoint[];
  bestSellingProduct: BestSellingProduct | null;
}

export function getDashboardMetrics(): Promise<DashboardMetrics> {
  return apiFetch<DashboardMetrics>("/metrics/dashboard");
}
