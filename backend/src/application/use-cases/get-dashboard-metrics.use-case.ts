import { Inject, Injectable } from '@nestjs/common';
import type {
  DashboardMetricsOutput,
  DailySalesPoint,
  GetDashboardMetricsInput,
} from '../dtos/dashboard-metrics.dto';
import type { ISaleRepository } from '../../domain/repositories/sale.repository';
import { SALE_REPOSITORY } from '../../domain/repositories/sale.repository';
import type { IProductRepository } from '../../domain/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository';
import type { Sale } from '../../domain/entities/sale.entity';

const DAYS_WINDOW = 7;

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(
    @Inject(SALE_REPOSITORY)
    private readonly saleRepository: ISaleRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    input: GetDashboardMetricsInput,
  ): Promise<DashboardMetricsOutput> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const windowStart = addDays(todayStart, -(DAYS_WINDOW - 1));

    const [sales, products] = await Promise.all([
      this.saleRepository.listCompletedSince(input.tenantId, windowStart),
      this.productRepository.listByTenant(input.tenantId),
    ]);

    const costByProduct = new Map<string, number>(
      products.map((product) => [product.id, product.costUSD]),
    );

    let todayCount = 0;
    let todaySalesUSD = 0;
    let todayGrossProfitUSD = 0;
    let weekCount = 0;
    let weekSalesUSD = 0;
    let weekGrossProfitUSD = 0;

    const quantityByProduct = new Map<string, number>();
    const dailySalesMap = new Map<
      string,
      { salesCount: number; salesUSD: number }
    >();

    for (const sale of sales) {
      if (!this.isCompleted(sale)) {
        continue;
      }
      const profit = this.computeGrossProfit(sale, costByProduct);
      const isToday = sale.createdAt >= todayStart;

      weekCount += 1;
      weekSalesUSD += sale.totalUSD;
      weekGrossProfitUSD += profit;
      if (isToday) {
        todayCount += 1;
        todaySalesUSD += sale.totalUSD;
        todayGrossProfitUSD += profit;
      }

      const key = dateKey(sale.createdAt);
      const daily = dailySalesMap.get(key) ?? { salesCount: 0, salesUSD: 0 };
      daily.salesCount += 1;
      daily.salesUSD += sale.totalUSD;
      dailySalesMap.set(key, daily);

      for (const item of sale.items) {
        quantityByProduct.set(
          item.productId,
          (quantityByProduct.get(item.productId) ?? 0) + item.quantity,
        );
      }
    }

    const dailySales: DailySalesPoint[] = [];
    for (let index = 0; index < DAYS_WINDOW; index += 1) {
      const date = addDays(windowStart, index);
      const key = dateKey(date);
      const point = dailySalesMap.get(key) ?? { salesCount: 0, salesUSD: 0 };
      dailySales.push({
        date: key,
        salesCount: point.salesCount,
        salesUSD: round2(point.salesUSD),
      });
    }

    let bestProductId: string | null = null;
    let bestQuantity = 0;
    for (const [productId, quantity] of quantityByProduct) {
      if (quantity > bestQuantity) {
        bestProductId = productId;
        bestQuantity = quantity;
      }
    }

    const bestProduct = products.find(
      (product) => product.id === bestProductId,
    );

    return {
      today: {
        salesCount: todayCount,
        salesUSD: round2(todaySalesUSD),
        grossProfitUSD: round2(todayGrossProfitUSD),
      },
      last7Days: {
        salesCount: weekCount,
        salesUSD: round2(weekSalesUSD),
        grossProfitUSD: round2(weekGrossProfitUSD),
      },
      dailySales,
      bestSellingProduct: bestProduct
        ? {
            productId: bestProduct.id,
            productName: bestProduct.name,
            productSku: bestProduct.sku,
            quantitySold: bestQuantity,
          }
        : null,
    };
  }

  private isCompleted(sale: Sale): boolean {
    return sale.status === 'COMPLETED';
  }

  private computeGrossProfit(
    sale: Sale,
    costByProduct: Map<string, number>,
  ): number {
    return sale.items.reduce((sum, item) => {
      const costUSD = costByProduct.get(item.productId) ?? 0;
      return sum + (item.unitPriceUSD - costUSD) * item.quantity;
    }, 0);
  }
}
