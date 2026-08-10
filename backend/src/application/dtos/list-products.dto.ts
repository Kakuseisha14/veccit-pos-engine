import type { ProductOutput } from './product.dto';

export interface ListProductsInput {
  tenantId: string;
  includeCost: boolean;
}

export interface ListProductsOutput {
  products: ProductOutput[];
}
