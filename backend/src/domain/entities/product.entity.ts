import { randomUUID } from 'node:crypto';

export interface CreateProductInput {
  tenantId: string;
  sku: string;
  name: string;
  description?: string | null;
  priceUSD: number;
  costUSD: number;
  stock: number;
  minStock: number;
  categoryId?: string | null;
}

export class Product {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly sku: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly priceUSD: number,
    public readonly costUSD: number,
    public readonly stock: number,
    public readonly minStock: number,
    public readonly categoryId: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: CreateProductInput): Product {
    const now = new Date();
    return new Product(
      randomUUID(),
      input.tenantId,
      input.sku.trim().toUpperCase(),
      input.name.trim(),
      input.description?.trim() || null,
      input.priceUSD,
      input.costUSD,
      input.stock,
      input.minStock,
      input.categoryId ?? null,
      true,
      now,
      now,
    );
  }

  isLowStock(): boolean {
    return this.stock <= this.minStock;
  }

  withStock(newStock: number): Product {
    return new Product(
      this.id,
      this.tenantId,
      this.sku,
      this.name,
      this.description,
      this.priceUSD,
      this.costUSD,
      newStock,
      this.minStock,
      this.categoryId,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }
}
