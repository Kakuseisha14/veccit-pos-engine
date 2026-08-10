export interface ProductOutput {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  priceUSD: number;
  costUSD: number;
  stock: number;
  minStock: number;
  categoryId: string | null;
  categoryName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
