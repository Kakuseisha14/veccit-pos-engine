export class SaleNotFoundException extends Error {
  constructor(saleId: string) {
    super(`Venta no encontrada con ID: ${saleId}`);
    this.name = 'SaleNotFoundException';
  }
}
