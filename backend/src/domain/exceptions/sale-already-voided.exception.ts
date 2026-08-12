export class SaleAlreadyVoidedException extends Error {
  constructor(id: string) {
    super(`La venta ${id} ya fue anulada`);
    this.name = 'SaleAlreadyVoidedException';
  }
}
