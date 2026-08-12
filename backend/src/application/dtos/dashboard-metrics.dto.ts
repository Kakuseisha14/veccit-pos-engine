export interface DashboardMetricTotals {
  salesCount: number;
  salesUSD: number;
  grossProfitUSD: number;
}

export interface BestSellingProductOutput {
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

export interface DashboardMetricsOutput {
  today: DashboardMetricTotals;
  last7Days: DashboardMetricTotals;
  dailySales: DailySalesPoint[];
  bestSellingProduct: BestSellingProductOutput | null;
}

export interface GetDashboardMetricsInput {
  tenantId: string;
}
