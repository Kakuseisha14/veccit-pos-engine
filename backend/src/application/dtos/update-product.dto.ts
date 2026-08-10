import type { ProductOutput } from './product.dto';

export interface UpdateProductInput {
  tenantId: string;
  productId: string;
  sku?: string;
  name?: string;
  description?: string | null;
  priceUSD?: number;
  costUSD?: number;
  minStock?: number;
  categoryId?: string | null;
  isActive?: boolean;
}

export interface UpdateProductOutput {
  product: ProductOutput;
}
