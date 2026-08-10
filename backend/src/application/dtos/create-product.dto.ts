import type { ProductOutput } from './product.dto';

export interface CreateProductInput {
  tenantId: string;
  sku: string;
  name: string;
  description?: string | null;
  priceUSD: number;
  costUSD?: number;
  stock?: number;
  minStock?: number;
  categoryId?: string | null;
}

export interface CreateProductOutput {
  product: ProductOutput;
}
