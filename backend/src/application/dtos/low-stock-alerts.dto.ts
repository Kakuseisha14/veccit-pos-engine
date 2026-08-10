import type { ProductOutput } from './product.dto';

export interface LowStockAlertsOutput {
  count: number;
  products: ProductOutput[];
}
