export class InsufficientStockException extends Error {
  constructor(
    productId: string,
    currentStock: number,
    requestedQuantity: number,
  ) {
    super(
      `Stock insuficiente para el producto ${productId}: actual ${currentStock}, salida solicitada ${requestedQuantity}`,
    );
    this.name = 'InsufficientStockException';
  }
}
