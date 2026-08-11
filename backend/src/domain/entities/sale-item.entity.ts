import { randomUUID } from 'node:crypto';

export interface CreateSaleItemInput {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPriceUSD: number;
}

export class SaleItem {
  constructor(
    public readonly id: string,
    public readonly saleId: string,
    public readonly productId: string,
    public readonly productName: string,
    public readonly productSku: string,
    public readonly quantity: number,
    public readonly unitPriceUSD: number,
    public readonly subtotalUSD: number,
  ) {}

  static create(saleId: string, input: CreateSaleItemInput): SaleItem {
    const subtotal = Number((input.quantity * input.unitPriceUSD).toFixed(2));
    return new SaleItem(
      randomUUID(),
      saleId,
      input.productId,
      input.productName,
      input.productSku,
      input.quantity,
      input.unitPriceUSD,
      subtotal,
    );
  }
}
